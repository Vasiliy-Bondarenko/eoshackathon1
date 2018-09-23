#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>
#include <eosiolib/singleton.hpp>
using namespace eosio;

// Smart Contract Name: notechain
// Table struct:
//   notestruct: multi index table to store the notes
//     prim_key(uint64): primary key
//     user(account_name/uint64): account name for the user
//     note(string): the note message
//     timestamp(uint64): the store the last update block time
// Public method:
//   isnewuser => to check if the given account name has note in table or not
// Public actions:
//   update => put the note into the multi-index table and sign by the given account

// Replace the contract class name when you start your own project

double inline computeTrustScore(const double &voter_score, const double &voted_for_score, const int8_t &vote_strength)
{
  return voted_for_score + 0.1 * vote_strength / 100 * voter_score;
}
class notechain : public eosio::contract
{
private:
  /// @abi table votes i64
  struct s_vote
  {
    // scoped by account_name
    account_name voted_for;
    int8_t vote_strength;

    auto primary_key() const { return voted_for; }
  };

  /// @abi table accounts2 i64
  struct s_account
  {
    account_name name;
    double trust_score;
    bool kycd;

    auto primary_key() const { return name; }
  };

  /// @abi table kycproviders i64
  struct s_kyc_provider
  {
    account_name name;

    auto primary_key() const { return name; }
  };

  typedef eosio::multi_index<N(votes), s_vote> tb_votes;
  typedef eosio::multi_index<N(accounts2), s_account> tb_accounts;
  typedef eosio::multi_index<N(kycproviders), s_kyc_provider> tb_kyc_providers;

  tb_kyc_providers kyc_providers;
  tb_accounts accounts;

public:
  notechain(account_name self) : contract(self), kyc_providers(_self, _self), accounts(_self, _self)
  {
  }

  /// @abi action
  void registeracct(account_name user)
  {
    eosio_assert(accounts.find(user) == accounts.end(), "account already exists");
    // let _self pay for the RAM
    accounts.emplace(_self, [&](s_account &a) {
      a.name = user;
      a.trust_score = 1.0;
      a.kycd = false;
    });
  }

  /// @abi action
  void vote(account_name voter_name, account_name voted_for_name, int8_t vote_strength)
  {
    require_auth(voter_name);

    eosio_assert(vote_strength >= -100 && vote_strength <= 100, "vote strength must be between -100 and 100");

        auto voter_account = accounts.find(voter_name);
    eosio_assert(voter_account != accounts.end(), "voter account does not exist");

    auto voted_for_account = accounts.find(voted_for_name);
    eosio_assert(voted_for_account != accounts.end(), "account being voted for does not exist");

    tb_votes votes_from_voter(_self, voter_name);
    auto vote = votes_from_voter.find(voted_for_name);
    eosio_assert(vote == votes_from_voter.end(), "already voted for that account");

    votes_from_voter.emplace(voter_name, [&](s_vote &v) {
      v.voted_for = voted_for_name;
      v.vote_strength = vote_strength;
    });

    double newScore = computeTrustScore(voter_account->trust_score, voted_for_account->trust_score, vote_strength);
    // _self pays for RAM
    accounts.modify(voted_for_account, _self, [&](auto &a) {
      a.trust_score = newScore;
    });
  }

  /// @abi action
  void submitkyc(account_name kyc_provider, account_name user_name)
  {
    require_auth(kyc_provider);

    // KYC provider must be in our list of trusted KYC providers
    auto found_provider = kyc_providers.find(kyc_provider);
    eosio_assert(found_provider != kyc_providers.end(), "KYC submission from this account are not supported");

    tb_accounts user(_self, user_name);
    auto user_account = accounts.find(user_name);
    eosio_assert(user_account != accounts.end(), "account does not exist");

    // _self pays for RAM
    accounts.modify(user_account, _self, [&](auto &a) {
      a.kycd = true;
    });
  }

  /// @abi action
  void addkycprovdr(account_name kyc_provider)
  {
    // only we can add new kyc providers
    require_auth(_self);

    // KYC provider must be in our list of trusted KYC providers
    auto found_provider = kyc_providers.find(kyc_provider);
    eosio_assert(found_provider == kyc_providers.end(), "KYC provider already exists");

    kyc_providers.emplace(_self, [&](s_kyc_provider &p) {
      p.name = kyc_provider;
    });
  }

  // THIS ACTION IS ONLY FOR DEMONSTRATION PURPOSES
  /// @abi action
  void reset()
  {
    for (auto it = accounts.begin(); it != accounts.end(); it++)
    {
      // delete all votes of that account
      tb_votes votes(_self, it->name);
      auto vote = votes.begin();
      while (vote != votes.end())
      {
        vote = votes.erase(vote);
      }

      // reset score to 1
      accounts.modify(it, _self, [&](auto &a) {
        a.trust_score = 1.0;
        a.kycd = false;
      });
      eosio::print("Reset account ", name{it->name}, " | ");
    }

    accounts.modify(accounts.find(N(useraaaaaaaa)), _self, [&](auto &a) {
      a.trust_score = 10;
    });

    accounts.modify(accounts.find(N(useraaaaaaab)), _self, [&](auto &a) {
      a.trust_score = 100;
    });

    accounts.modify(accounts.find(N(useraaaaaaac)), _self, [&](auto &a) {
      a.trust_score = 200;
    });
  }
};

EOSIO_ABI(notechain, (registeracct)(vote)(submitkyc)(addkycprovdr)(reset))

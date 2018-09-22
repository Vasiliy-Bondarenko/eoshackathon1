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

double inline computeTrustScore(double &voter_score, double &voted_for_score, bool upvote)
{
  return voted_for_score + 0.1 * voter_score * (upvote ? 1 : -1);
}
class notechain : public eosio::contract
{
private:
  /// @abi table
  struct s_vote
  {
    // scoped by account_name
    account_name voted_for;
    // true = upvote, false = downvote
    bool upvote;

    auto primary_key() const { return voted_for; }
  };

  /// @abi table
  struct s_account
  {
    account_name name;
    double trust_score;
    bool kycd;

    auto primary_key() const { return name; }
  };

  /// @abi table
  struct s_kyc_provider
  {
    account_name name;

    auto primary_key() const { return name; }
  };

  typedef eosio::multi_index<N(votes), s_vote>
      tb_votes;
  typedef eosio::singleton<N(accounts), s_account> tb_accounts;
  typedef eosio::multi_index<N(kycproviders), s_kyc_provider> tb_kyc_providers;

  tb_kyc_providers kyc_providers;

public:
  notechain(account_name self) : contract(self), kyc_providers(_self, _self)
  {
  }

  /// @abi action
  void registeracct(account_name user)
  {
    tb_accounts accounts(_self, user);
    eosio_assert(!accounts.exists(), "account already exists");
    // let _self pay for the RAM
    accounts.set(s_account{user}, _self);
  }

  /// @abi action
  void vote(account_name voter_name, account_name voted_for_name, bool upvote)
  {
    require_auth(voter_name);

    tb_accounts voter(_self, voter_name);
    eosio_assert(voter.exists(), "voter account does not exist");
    s_account voter_account = voter.get();

    tb_accounts voted_for(_self, voted_for_name);
    eosio_assert(voted_for.exists(), "account being voted for does not exist");
    s_account voted_for_account = voted_for.get();

    tb_votes votes_from_voter(_self, voter_name);
    auto vote = votes_from_voter.find(voted_for_name);
    eosio_assert(vote == votes_from_voter.end(), "already voted for that account");

    votes_from_voter.emplace(voter_name, [&](s_vote &v) {
      v.voted_for = voted_for_name;
      v.upvote = upvote;
    });

    voted_for_account.trust_score = computeTrustScore(voter_account.trust_score, voted_for_account.trust_score, upvote);
    // _self pays for RAM
    voted_for.set(voted_for_account, _self);
  }
};

EOSIO_ABI(notechain, (registeracct))

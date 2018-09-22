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
class notechain : public eosio::contract
{
private:
  /// @abi table
  struct s_vote
  {
    uint64_t id;
    account_name voter;
    account_name voted_for;

    auto primary_key() const { return id; }
  };

  /// @abi table
  struct s_account
  {
    account_name name;
    uint32_t trust_score;

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

  tb_votes votes;
  tb_kyc_providers kyc_providers;

public:
  notechain(account_name self) : contract(self), votes(_self, _self), kyc_providers(_self, _self)
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


};

EOSIO_ABI(notechain, (registeracct))

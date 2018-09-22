import React, { Component } from 'react';
import Eos from 'eosjs'; // https://github.com/EOSIO/eosjs
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/lab/Slider';

// Index component
class VoteBtn extends Component {
    constructor(props) {
        super( props )
        this.state           = {
            voteValue: 0,
            accounts: props.accounts,
            name: props.name,
        };
        this.vote = this.vote.bind( this );
    }

    async vote() {
        const votedUser = this.state.name
        const value = this.state.voteValue
        const votingUser = this.state.actingAs
        const eos = Eos( { keyProvider: this.privKeyFor( votingUser ) } );
        const tx  = {
            actions: [{
                account: "notechainacc",
                name: "vote",
                authorization: [{
                    actor: votingUser,
                    permission: 'active',
                }],
                data: {
                    voter_name: votingUser,
                    voted_for_name: votedUser,
                    upvote: value,
                },
            }],
        }
        console.log( "tx:", tx )

        const result = await eos.transaction( tx );
        console.log( result );

        // refresh table to get updated info
        this.refreshTable();
    }

    privKeyFor() {
        return _.find( this.state.accounts, a => a.name === this.state.name).privateKey
    }

    // gets table data from the blockchain
    // and saves it into the component state: "accountsTable"
    async refreshTable() {
        const eos    = Eos();
        const result = await eos.getTableRows( {
            "json": true,
            "code": "notechainacc",   // contract who owns the table
            "scope": "notechainacc",  // scope of the table
            "table": "accounts2",     // name of the table as specified by the contract abi
            "limit": 100,
        } );

        console.log( result );
        this.setState( { accountsTable: result.rows } )
    }

    handleChange = (event, value) => {
        this.setState({ voteValue: value });
    };

    render() {
        return (
            <div>
                {this.state.voteValue}
                <Slider value={this.state.voteValue}
                        onChange={this.handleChange}
                        max={10}
                        min={-10}
                        step={1}
                />
                <Button onClick={e => {this.vote()}}
                    variant="contained"
                    color="primary"
                >Vote</Button>
            </div>
        );
    }

}

export default VoteBtn;

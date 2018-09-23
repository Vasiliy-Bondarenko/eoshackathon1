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
        };
        this.vote = this.vote.bind( this );
    }

    async vote() {
        const votedUser = this.props.name
        const votingUser = this.props.actingAs
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
                    vote_strength: this.state.voteValue,
                },
            }],
        }
        console.log( "tx:", tx )

        const result = await eos.transaction( tx );
        console.log( result );

        // refresh table to get updated info
        this.props.refreshTable();
    }

    privKeyFor() {
        return _.find( this.props.accounts, a => a.name === this.props.actingAs).privateKey
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
                <div style={{ fontSize: 25, marginTop: "10px" }} >
                    {this.state.voteValue}%
                </div>
                <Slider value={this.state.voteValue}
                        onChange={this.handleChange}
                        max={100}
                        min={-100}
                        step={5}
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

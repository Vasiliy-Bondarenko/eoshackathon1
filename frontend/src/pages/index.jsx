import React, { Component } from 'react';
import Eos from 'eosjs'; // https://github.com/EOSIO/eosjs
import _ from 'lodash';
// material-ui dependencies
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
// import TextField from '@material-ui/core/TextField';
// import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import VoteBtn from './VoteBtn.jsx';

// This is for demo purposes only!
import accounts from '../accounts'
import styles from '../styles'

// Index component
class Index extends Component {
    constructor(props) {
        super( props )
        this.state           = {
            // to store the table rows from smart contract
            accountsTable: [],
            actingAs: "useraaaaaaab"
        };
        this.vote = this.vote.bind( this );
        this.refreshTable = this.refreshTable.bind( this );
    }

    async vote(votedUser) {
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
                    upvote: 5, // take this value from slider or radiobutton
                },
            }],
        }
        console.log( "tx:", tx )

        const result = await eos.transaction( tx );
        console.log( result );

        // refresh table to get updated info
        this.refreshTable();
    }

    async kycApprove(user) {
        const eos = Eos( { keyProvider: this.privKeyFor( this.state.actingAs ) } );
        const tx  = {
            actions: [{
                account: "notechainacc",
                name: "submitkyc",
                authorization: [{
                    actor: this.state.actingAs,
                    permission: 'active',
                }],
                data: {
                    kyc_provider: this.state.actingAs,
                    user_name: user,
                },
            }],
        }
        console.log( "tx:", tx )

        const result = await eos.transaction( tx );
        console.log( result );

        // refresh table to get updated info
        this.refreshTable();
    }

    privKeyFor(account) {
        return _.find( accounts, a => a.name === account).privateKey
    }

    actAs(user) {
        this.setState( state => ({
            actingAs: user
        }) );
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

    // on page load
    componentDidMount() {
        this.refreshTable();
    }

    render() {
        const { accountsTable, actingAs } = this.state;
        const { classes }                 = this.props;

        // generate each note as a card
        const generateCard = (index, row) => (
            <Card className={classes.card} key={index}>
                <CardContent>
                    <Avatar alt="Remy Sharp"
                            src={"http://i.pravatar.cc/300?cache=" + index} // set to index to get random image
                            className={classes.avatar}
                    />

                    <Typography variant="headline" component="h2">
                        {row.name === actingAs &&
                        <strong style={{ color: "green" }}>
                            Acting as:
                        </strong>
                        }
                        {row.name}
                        {row.name === "kycprovider1" &&
                        <strong style={{ color: "green", weight: "bold" }}>KYC provider</strong>
                        }
                    </Typography>
                    <Typography style={{ fontSize: 12 }} color="textSecondary" gutterBottom>
                        KYC: {row.kycd ? "YES" : "NO"}
                    </Typography>
                    <Typography component="pre">
                        {parseFloat(row.trust_score).toFixed(2)}
                    </Typography>
                    <Typography component="pre">
                        <Button
                            onClick={e => {this.actAs( row.name )}}
                            variant="contained"
                            color="default"
                            className={classes.button}
                        >Act as</Button>
                    </Typography>
                    <Typography component="pre">
                        <VoteBtn accounts={accounts}
                                 name={row.name}
                                 actingAs={this.state.actingAs}
                                 refreshTable={this.refreshTable}
                        />
                        {actingAs === "kycprovider1" &&
                        <Button
                            onClick={e => {this.kycApprove( row.name )}}
                            variant="contained"
                            color="primary"
                            className={classes.button}
                        >KYC approve</Button>
                        }
                    </Typography>
                </CardContent>
            </Card>
        );
        let profiles      = accountsTable.map( (row, i) =>
            generateCard( i, row )
        );

        return (
            <div>
                <AppBar position="static" color="default">
                    <Toolbar>
                        <Typography variant="title" color="inherit">
                            EOS Profiles
                        </Typography>
                    </Toolbar>
                </AppBar>
                {profiles}
                {/*<Paper className={classes.paper}>
                    <form onSubmit={this.vote}>
                        <TextField
                            name="account"
                            autoComplete="off"
                            label="Account"
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            name="privateKey"
                            autoComplete="off"
                            label="Private key"
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            name="note"
                            autoComplete="off"
                            label="Note (Optional)"
                            margin="normal"
                            multiline
                            rows="10"
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            className={classes.formButton}
                            type="submit">
                            Add / Update note
                        </Button>
                    </form>
                </Paper>*/}
                {/*<pre className={classes.pre}>
                  Below is a list of pre-created accounts information for add/update note:
                  <br/><br/>
                  accounts = {JSON.stringify( accounts, null, 2 )}
                </pre>*/}
            </div>
        );
    }

}

export default withStyles( styles )( Index );

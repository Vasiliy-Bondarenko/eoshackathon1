import React, { Component } from 'react';
import Eos from 'eosjs'; // https://github.com/EOSIO/eosjs
// material-ui dependencies
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import _ from 'lodash';


// NEVER store private keys in any source code in your real life development
// This is for demo purposes only!
const accounts = [
    { "name": "useraaaaaaaa", "privateKey": "5K7mtrinTFrVTduSxizUc5hjXJEtTjVTsqSHeBHes1Viep86FP5", "publicKey": "EOS6kYgMTCh1iqpq9XGNQbEi8Q6k5GujefN9DSs55dcjVyFAq7B6b" },
    { "name": "useraaaaaaab", "privateKey": "5KLqT1UFxVnKRWkjvhFur4sECrPhciuUqsYRihc1p9rxhXQMZBg", "publicKey": "EOS78RuuHNgtmDv9jwAzhxZ9LmC6F295snyQ9eUDQ5YtVHJ1udE6p" },
    { "name": "useraaaaaaac", "privateKey": "5K2jun7wohStgiCDSDYjk3eteRH1KaxUQsZTEmTGPH4GS9vVFb7", "publicKey": "EOS5yd9aufDv7MqMquGcQdD6Bfmv6umqSuh9ru3kheDBqbi6vtJ58" },
    { "name": "useraaaaaaad", "privateKey": "5KNm1BgaopP9n5NqJDo9rbr49zJFWJTMJheLoLM5b7gjdhqAwCx", "publicKey": "EOS8LoJJUU3dhiFyJ5HmsMiAuNLGc6HMkxF4Etx6pxLRG7FU89x6X" },
    { "name": "useraaaaaaae", "privateKey": "5KE2UNPCZX5QepKcLpLXVCLdAw7dBfJFJnuCHhXUf61hPRMtUZg", "publicKey": "EOS7XPiPuL3jbgpfS3FFmjtXK62Th9n2WZdvJb6XLygAghfx1W7Nb" },
    { "name": "useraaaaaaaf", "privateKey": "5KaqYiQzKsXXXxVvrG8Q3ECZdQAj2hNcvCgGEubRvvq7CU3LySK", "publicKey": "EOS5btzHW33f9zbhkwjJTYsoyRzXUNstx1Da9X2nTzk8BQztxoP3H" },
    { "name": "useraaaaaaag", "privateKey": "5KFyaxQW8L6uXFB6wSgC44EsAbzC7ideyhhQ68tiYfdKQp69xKo", "publicKey": "EOS8Du668rSVDE3KkmhwKkmAyxdBd73B51FKE7SjkKe5YERBULMrw" }
];

// set up styling classes using material-ui "withStyles"
const styles = theme => ({
    card: {
        margin: 20,
    },
    paper: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    formButton: {
        marginTop: theme.spacing.unit,
        width: "100%",
    },
    pre: {
        background: "#ccc",
        padding: 10,
        marginBottom: 0.
    },
});

// Index component
class Index extends Component {

    constructor(props) {
        super( props )
        this.state           = {
            noteTable: [], // to store the table rows from smart contract
            actingAs: "useraaaaaaab"
        };
        this.handleFormEvent = this.handleFormEvent.bind( this );
    }

    // generic function to handle form events (e.g. "submit" / "reset")
    // push transactions to the blockchain by using eosjs
    async handleFormEvent(votingUser, votedUser, direction) {
        // console.log( "votingUser", votingUser )
        // console.log( "votedUser", votedUser )
        const privateKey = this.privKeyFor( votingUser )
        const actionData = {
            _user: votedUser,
            _note: `${votingUser} voted ${direction} ${votedUser}`,
        };
        const eos        = Eos( { keyProvider: privateKey } );

        const tx = {
            actions: [{
                account: "notechainacc",
                name: "update",
                authorization: [{
                    actor: votingUser,
                    permission: 'active',
                }],
                data: actionData,
            }],
        }

        console.log( "tx:", tx )

        const result = await eos.transaction( tx );

        console.log( result );
        // refresh table to get updated info
        this.getTable();
    }

    privKeyFor(account) {
        return _.find( accounts, function (a) { return a.name === account; } ).privateKey
    }

    actAs(user) {
        this.setState( state => ({
            actingAs: user
        }) );
    }

    voteUp(votedUser) {
        const votingUser = this.state.actingAs
        this.handleFormEvent( votingUser, votedUser, "UP" )
    }

    voteDown(votedUser) {
        const votingUser = this.state.actingAs
        this.handleFormEvent( votingUser, votedUser, "DOWN" )
    }

    // gets table data from the blockchain
    // and saves it into the component state: "noteTable"
    async getTable() {
        const eos    = Eos();
        const result = await eos.getTableRows( {
            "json": true,
            "code": "notechainacc",   // contract who owns the table
            "scope": "notechainacc",  // scope of the table
            "table": "notestruct",    // name of the table as specified by the contract abi
            "limit": 100,
        } );

        console.log( result );
        this.setState( { noteTable: result.rows } )
    }

    // on page load
    componentDidMount() {
        this.getTable();
    }

    render() {
        const { noteTable, actingAs } = this.state;
        const { classes }             = this.props;

        // generate each note as a card
        const generateCard = (key, timestamp, user, note) => (
            <Card className={classes.card} key={key}>
                <CardContent>
                    <Typography variant="headline" component="h2">
                        {user === actingAs &&
                        <strong style={{ color: "green" }}>Acting as: </strong>
                        }
                        {user}
                    </Typography>
                    <Typography style={{ fontSize: 12 }} color="textSecondary" gutterBottom>
                        {new Date( timestamp * 1000 ).toString()}
                    </Typography>
                    <Typography component="pre">
                        {note}
                    </Typography>
                    <Typography component="pre">
                        <button onClick={e => {this.actAs( user )}}>Act as</button>
                    </Typography>
                    <Typography component="pre">
                        <button onClick={e => {this.voteUp( user )}}>Vote Up</button>
                        <button onClick={e => {this.voteDown( user )}}>Vote Down</button>
                    </Typography>
                </CardContent>
            </Card>
        );
        let noteCards      = noteTable.map( (row, i) =>
            generateCard( i, row.timestamp, row.user, row.note ) );

        return (
            <div>
                <AppBar position="static" color="default">
                    <Toolbar>
                        <Typography variant="title" color="inherit">
                            Note Chain
                        </Typography>
                    </Toolbar>
                </AppBar>
                {noteCards}
                <Paper className={classes.paper}>
                    <form onSubmit={this.handleFormEvent}>
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
                </Paper>
                <pre className={classes.pre}>
          Below is a list of pre-created accounts information for add/update note:
          <br/><br/>
          accounts = {JSON.stringify( accounts, null, 2 )}
        </pre>
            </div>
        );
    }

}

export default withStyles( styles )( Index );

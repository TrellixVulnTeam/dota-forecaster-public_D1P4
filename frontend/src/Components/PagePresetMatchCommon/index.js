import React from "react"
import './style.css'
import {
    Container,
    Button,
    Spinner,
} from 'reactstrap';
import './style.css'

import {
    useParams
} from "react-router-dom";
import Header from "../Header";

function PageCaptionMatch() {
    let {matchId} = useParams();
    return <Header text={"Предсказание по матчу " + matchId}/>;
}

function ButtonCallMatch(props) {
    let {matchId} = useParams();
    return <Button
        size={'lg'}
        onClick={() => props.sender(matchId - 1)}
        color="secondary">
        Получить результат
    </Button>
}


export default class PagePresetMatchCommon extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isError: false,
            isShown: false,
            plot_dire: "",
            plot_radiant: "",
            match_id: "",
            dataChanged: false,
            dataWasReceived: false,
            dataWasSend: false
        };
        this.fieldChange = this.fieldChange.bind(this);
    }

    setFieldsToState(e) {
        this.setState({
            [e.target.name]: e.target.value,
            dataChanged: true,
        });
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(100);
            }, 200)
        });
    }

    fieldChange(value) {
        this.setFieldsToState(value);
    }

    sendData = (matchId) => {
        this.setState({
            dataWasSend: true,
            dataWasReceived: false
        })

        let options = {
            headers: {
                'Accept': 'application/json',
            },
            method: 'POST'
        };
        options.body = JSON.stringify({'match_id': matchId})

        fetch('/api/model_view', options)
            .then((response) => {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    this.setState({
                        isError: true
                    });
                    return;
                }
                return response.json();
            })
            .then((data) => {
                if (!this.state.isError) {
                    this.setState({
                        dataWasReceived: true,
                        dataWasSend: false,
                        receivedImageDire: data.plot_dire,
                        receivedImageRadiant: data.plot_radiant,
                        match_id: data.match_id
                    })
                }
            })
            .catch((err) => {
                console.log('Fetch Error:', err);
            });
    }

    changeEndpoint(endpoint) {
        window.location = '/' + endpoint
    }

    componentDidMount() {

    }

    render() {
        return (
            <Container>
                <PageCaptionMatch/>
                <div className={"center-text"}>
                    <ButtonCallMatch sender={this.sendData}/>
                </div>
                <br/>
                {this.state.dataWasSend ? <Spinner color="info"/> : <></>}
                {this.state.dataWasReceived ? <div>

                    <h2>График вероятности победы команды Radiant:</h2>
                    <img id="encryptedRes" className="rounded mx-auto d-block"
                         src={this.state.receivedImageDire} alt="plot"/>

                    <h2>График вероятности победы команды Dire:</h2>
                    <img id="encryptedRes" className="rounded mx-auto d-block"
                         src={this.state.receivedImageRadiant} alt="plot"/>
                </div> : <></>}
            </Container>
        );
    }
}
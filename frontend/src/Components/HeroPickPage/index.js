import React from "react"
import './style.css'
import {
    Container,
    Row,
    Col,
    Button, Spinner,
} from 'reactstrap';

import Header from '../Header'
import './style.css'
import HeroPicker from "./HeroPicker";


export default class HeroPickPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isError: false,
            isShown: false,
            dataChanged: false,
            dataWasReceived: false,
            dataWasSend: false,


            dire_codes: [-1, -1, -1, -1, -1],
            radiant_codes: [-1, -1, -1, -1, -1],

            radiant_proba: -1,
            dire_proba: -1
        };
    }


    sendData() {
        this.setState({
            dataWasSend:true
        })
        let options = {
            headers: {
                'Accept': 'application/json',
            },
            method: 'POST'
        };
        options.body = JSON.stringify({
            'dire_heroes': this.state.dire_codes,
            'radiant_heroes': this.state.radiant_codes
        })

        fetch('/api/hero_pick', options)
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
                        radiant_proba: data.radiant_proba,
                        dire_proba: data.dire_proba
                    })
                }
            })
            .catch((err) => {
                console.log('Fetch Error:', err);
            });
    }

    testChangeDire = (hero_number, code) => {
        let arr = this.state.dire_codes;
        arr[hero_number] = code
        this.setState({
            dire_codes: arr
        });
    }
    testChangeRadiant = (hero_number, code) => {
        let arr = this.state.radiant_codes;
        arr[hero_number] = code
        this.setState({
            radiant_codes: arr
        });
    }

    renderDireTeam(amount) {
        let items = [];
        for (let i = 0; i < amount; i++) {
            items.push(<HeroPicker key={"dire_" + i} direction="left" onPickerChange={this.testChangeDire}
                                   team={this.state.dire_codes.concat(this.state.radiant_codes)} idx={i}/>)
        }
        return items
    }

    renderRadiantTeam(amount) {
        let items = [];
        for (let i = 0; i < amount; i++) {
            items.push(<HeroPicker key={"radiant_" + i} direction="right" onPickerChange={this.testChangeRadiant}
                                   team={this.state.dire_codes.concat(this.state.radiant_codes)} idx={i}/>)
        }
        return items
    }

    render() {
        console.log(this.state)
        return (
            <Container>
                <Header text={this.props.text}/>

                <Row>
                    <Col/>
                    <Col sm={4} lg={4}>
                        <h2 className={"text-center"}>Команда Dire</h2>
                        {this.renderDireTeam(5)}
                    </Col>
                    <Col/>
                    <Col sm={4} lg={4}>
                        <h2 className={"text-center"}>Команда Radiant</h2>
                        {this.renderRadiantTeam(5)}
                    </Col>
                    <Col/>
                </Row>

                <br/>
                <Row>
                    <Col/>
                    <Col sm={4}>
                        <Button
                            size={'lg'}
                            block
                            onClick={() => this.sendData()}
                            color="secondary"
                            disabled={this.state.radiant_codes.some(r => r === -1) || this.state.dire_codes.some(r => r === -1)}>
                            Получить результат {this.state.dataWasSend ? <Spinner color="info"/> : <></>}
                        </Button>
                    </Col>
                    <Col/>
                </Row>

                {this.state.dataWasReceived ? <div>
                    <h2 id="#results">Результаты матча:</h2>
                    <h3>Вероятность победы команды Radiant: {this.state.radiant_proba}</h3>
                    <h3>Вероятность победы команды Dire: {this.state.dire_proba}</h3>
                </div> : <></>}
            </Container>
        );
    }
}
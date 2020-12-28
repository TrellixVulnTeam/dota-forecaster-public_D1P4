import React from "react"
import './style.css'
import {Container} from 'reactstrap';
import Header from '../Header'
import './style.css'


export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

    }

    changeEndpoint(endpoint) {
        window.location = '/' + endpoint
    }

    render() {
        return (
            <Container>
                <Header text={this.props.text}/>
                <h2>
                    MADE, Осень 2020, Курс "Машинное обучение", ДЗ №4.
                </h2>
                <h3>Для начала работы выберите элемент в меню наверху.</h3>
            </Container>
        );
    }
}
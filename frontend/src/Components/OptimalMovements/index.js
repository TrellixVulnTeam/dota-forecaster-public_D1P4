import React from "react"
import './style.css'
import {
    Container,
    Button,
    Spinner, Form, FormGroup, Row, Col, Label, CustomInput,
} from 'reactstrap';
import './style.css'

import {
    useParams
} from "react-router-dom";
import Header from "../Header";
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";
import SampleFile from "../CustomMatch/files/result_match_0.csv";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import HeroPicker from "../HeroPickPage/HeroPicker";

function PageCaptionMatch() {
    return <Header text={"Оптимальные перемещения персонажа"}/>;
}

function ButtonCallMatch(props) {
    let {matchId} = useParams();
    return <Button
        size={'lg'}
        onClick={() => props.sender(matchId - 1)}
        color="secondary"
        disabled={props.hero_prefix === "" || props.hero_num === -1 || !props.fileLoaded}
    >
        Получить результат
    </Button>
}


export default class OptimalMovements extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isError: false,
            isShown: false,
            plotlyGraph: "",
            dataChanged: false,
            dataWasReceived: false,
            dataWasSend: false,
            hero_prefix: "",
            hero_num: -1,
            fileLoaded: false
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

    onSelectFile = e => {

        if (e.target.files && e.target.files.length > 0) {
            this.setState({file_name: e.target.files[0].name});


            const reader = new FileReader();
            reader.addEventListener("load", () => {
                    this.setState({file: reader.result,
                    fileLoaded: true});
                }
            );

            reader.readAsDataURL(e.target.files[0]);
        }
    };

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
        options.body = JSON.stringify({
            'file': this.state.file,
            'hero_prefix': this.state.hero_prefix,
            'hero_num': this.state.hero_num,
        })

        fetch('/api/optimal_movements', options)
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
                        plotlyGraph: data.plotly_graph,
                        dataWasReceived: true,
                        dataWasSend: false,
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

    renderHeroNum(amount) {
        let items = [];
        items.push(<DropdownItem key={"hero_none"} onClick={() => {
            this.setState({
                hero_num: -1
            });
        }}>Не выбрано</DropdownItem>);
        items.push(
            <DropdownItem divider/>)
        for (let i = 0; i < amount; i++) {
            let ord_num = i + 1;
            items.push(<DropdownItem onClick={() => {this.state.hero_num = ord_num}}>{ord_num}</DropdownItem>);
        }
        return items
    }

    render() {
        const Plot = createPlotlyComponent(Plotly);
        return (
            <Container>
                <PageCaptionMatch/>

                <div className={"center-text"}>
                    <a href={SampleFile} download>
                        <Button
                            size={'lg'}
                            color="secondary">
                            Скачать пример файла
                        </Button>
                    </a>
                </div>
                <br/>
                <Form>
                    <FormGroup>
                        <Row>
                            <Col sm={12} md={3} lg={2}>
                                <Label for="example_file">Пользовательский файл</Label>
                            </Col>
                            <Col>
                                <CustomInput type="file"
                                             id="match_file"
                                             name="file"
                                             onChange={this.onSelectFile}
                                             label="Выберете файл в формате *.csv"
                                             accept={".csv, .CSV"}
                                />
                            </Col>
                        </Row>
                    </FormGroup>
                </Form>
                <Form>
                    <FormGroup>
                        <Label>Выбор героя</Label>
                        <Row>
                            <Col sm={12} md={3} lg={2}>
                                <div className={"center-text"}>
                                    <Dropdown direction="down" isOpen={this.state.btnDropleft_dh1} toggle={() => {
                                        this.setState({ btnDropleft_dh1: !this.state.btnDropleft_dh1 });
                                    }}>
                                        <DropdownToggle caret>
                                            Выберите сторону
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem onClick={() => {this.state.hero_prefix = "r"}}>Radiant</DropdownItem>
                                            <DropdownItem onClick={() => {this.state.hero_prefix = "d"}}>Dire</DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            </Col>
                                <br/>
                            <Col sm={12} md={3} lg={2}>
                                <div className={"center-text"}>
                                    <Dropdown direction="down" isOpen={this.state.btnDropleft_num} toggle={() => {
                                        this.setState({ btnDropleft_num: !this.state.btnDropleft_num });
                                    }}>
                                        <DropdownToggle caret>
                                            Выберите номер героя
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {this.renderHeroNum(5)}
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            </Col>
                        </Row>
                    </FormGroup>
                </Form>
                <br/>

                    <h2>Оптимальные перемещения для персонажа {this.state.hero_num !== -1 ?
                        <>№{this.state.hero_num} ({this.state.hero_prefix === "r" ? "Radiant" : "Dire"})</> : <></>}</h2>

                <br/>
                <div className={"center-text"}>
                    <ButtonCallMatch sender={this.sendData}
                    hero_num={this.state.hero_num}
                    hero_prefix={this.state.hero_prefix}
                    fileLoaded={this.state.fileLoaded}/>
                </div>

                <br/>
                {this.state.dataWasSend ? <Spinner color="info"/> : <></>}
                {this.state.dataWasReceived ? <div>
                    <Plot
                        data={this.state.plotlyGraph.data}
                        layout={this.state.plotlyGraph.layout}
                    />
                </div> : <></>}
            </Container>
        );
    }
}

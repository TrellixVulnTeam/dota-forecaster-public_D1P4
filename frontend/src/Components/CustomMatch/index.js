import React from "react"
import './style.css'
import {
    Container,
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Button,
    CustomInput,
    Spinner
} from 'reactstrap';
import Header from '../Header'
import './style.css'
import SampleFile from './files/result_match_0.csv'

export default class CustomMatch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isError: false,
            isShown: false,
            file: "",
            text: "",
            dataChanged: false,
            dataWasReceived: false,
            dataWasSend: false,
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

    sendData() {
        this.setState({
            dataWasReceived: false,
            dataWasSend: true,
        })

        let options = {
            headers: {
                'Accept': 'application/json',
            },
            method: 'POST'
        };
        options.body = JSON.stringify({'file': this.state.file})

        fetch('/api/custom_file', options)
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

    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        <Header text={this.props.text}/>
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
                    </Col>
                </Row>
                <div className={"center-text"}>
                    <Button
                        size={'lg'}
                        onClick={() => this.sendData()}
                        color="secondary"
                        disabled={!this.state.fileLoaded}>
                        Получить результат
                    </Button>
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
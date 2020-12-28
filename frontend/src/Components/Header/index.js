import React from "react"
import './style.css'

export default class Index extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

    }

    render() {
        return (
            <div>
                <h1 className={"header-text"}>{this.props.text}</h1>
            </div>
        );
    }
}
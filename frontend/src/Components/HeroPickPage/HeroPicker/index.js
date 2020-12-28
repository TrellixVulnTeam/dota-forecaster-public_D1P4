import React from "react"
import './style.css'
import data from './data/heroes.json'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";

data.sort((a, b) => {
    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
        return 1;
    return 0;
});

function HeroLogo(props) {
    return <div className={"hero-image-container"}>
        <img src={"/hero_images/" + (props.image.length === 0 ? "logo.jpg" : props.image)}
             alt={"hero " + props.image}
             className={"hero-image rounded mx-auto d-block"}


        />
    </div>
}

export default class HeroPicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            name: "",
            image: ""
        };
        this.toggle = this.toggle.bind(this)
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    renderDropdown(array, hero_num = 0, handler, existing_elements = []) {
        let items = [];
        items.push(
            <DropdownItem key={"hero_none"} onClick={() => {
                this.setState({
                    image: "",
                    name: ""
                });
                handler(hero_num, -1)
            }}>Не выбрано</DropdownItem>)
        items.push(
            <DropdownItem divider/>)

        for (let i = 0; i < array.length; i++) {
            if (existing_elements.indexOf(array[i].code) >= 0) {
                continue
            }
            items.push(
                <DropdownItem key={"hero_" + i} onClick={() => {
                    this.setState({
                        image: array[i].image,
                        name: array[i].name
                    });
                    handler(hero_num, array[i].code)
                }}>{array[i].name}</DropdownItem>
            );
        }
        return items;

    }

    render() {
        return (
            <div className={"hero-container"}>

                <h6>Герой {this.props.idx + 1}{this.state.name ? ": " + this.state.name : ""}</h6>

                <Dropdown
                    // direction={this.props.direction}
                    isOpen={this.state.isOpen}
                    toggle={this.toggle}>
                    <DropdownToggle className="hero-dropdown" caret>
                        Выберите героя
                    </DropdownToggle>
                    <DropdownMenu className="hero-dropdown-menu">
                        {this.renderDropdown(data, this.props.idx, this.props.onPickerChange, this.props.team)}
                    </DropdownMenu>
                </Dropdown>
                <HeroLogo image={this.state.image}/>

            </div>
        );
    }
}
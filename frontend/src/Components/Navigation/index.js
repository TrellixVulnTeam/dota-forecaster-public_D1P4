import React from "react"
import './style.css'
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap';


export default class Navigation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
        };
        this.toggle = this.toggle.bind(this)

    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    render() {
        return (
            <Navbar color="dark" dark expand="md">
                <NavbarBrand href="/">Dota forecaster</NavbarBrand>
                <NavbarToggler onClick={this.toggle}/>
                <Collapse isOpen={this.state.isOpen} navbar>
                    <Nav className="ml-auto" navbar>
                        <UncontrolledDropdown nav inNavbar>
                            <DropdownToggle nav caret>
                                Загруженные заранее матчи
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem href='/preset_match_1'>
                                    Матч1
                                </DropdownItem>
                                <DropdownItem href='/preset_match_2'>
                                    Матч2
                                </DropdownItem>
                                <DropdownItem href='/preset_match_3'>
                                    Матч3
                                </DropdownItem>
                                <DropdownItem href='/preset_match_4'>
                                    Матч4
                                </DropdownItem>
                                <DropdownItem href='/preset_match_5'>
                                    Матч5
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                        <NavItem>
                            <NavLink href="/pick_heroes">Помощь в выборе героев</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/custom_match">Работа с пользовательскими файлами</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/optimal_movements">Оптимальное перемещение</NavLink>
                        </NavItem>

                    </Nav>
                </Collapse>
            </Navbar>

        );
    }
}
import './App.css';
import React from "react";


import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";


import CustomMatch from './Components/CustomMatch'
import MainPage from './Components/MainPage'
import Navigation from "./Components/Navigation";
import PagePresetMatchCommon from "./Components/PagePresetMatchCommon";
import HeroPickPage from "./Components/HeroPickPage";
import OptimalMovements from "./Components/OptimalMovements"

function App() {
    return (
        <div className="App">
            <Navigation/>
            <div className={"app-container"}>

                <Router>
                    <Switch>
                        <Route exact path="/">
                            <MainPage text="Dota forecaster"/>
                        </Route>

                        <Route path={'/preset_match_:matchId'}>
                            <PagePresetMatchCommon/>
                        </Route>

                        <Route exact path="/pick_heroes">
                            <HeroPickPage text="Выберете персонажей"/>
                        </Route>

                        <Route exact path="/custom_match">
                            <CustomMatch text="Загрузка пользовательского файла с событиями матча"/>
                        </Route>

                        <Route exact path="/optimal_movements">
                            <OptimalMovements text="Оптимальные перемещения персонажа"/>
                        </Route>
                    </Switch>
                </Router>
            </div>
        </div>
    );
}

export default App;

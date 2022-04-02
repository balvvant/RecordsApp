import React, { Component } from 'react';
import { connect } from 'react-redux';
import { globalAlertRemove } from '../actions/commonActions';

class AlertComponent extends Component {
    constructor(props) {
        super(props);
        this.state={
            count:0,
        }
    }

    update = () => {
        
        setTimeout(() => {
            globalAlertRemove()
        }, 10000)
    }


    render() {
        let modalOpen = false;
        var modals = document.getElementsByClassName('modal-own');
        if (modals.length > 0) {
            modalOpen = true;
        }

        const { alertArray } = this.props;
        return (
            <React.Fragment>
                {alertArray && alertArray.length > 0 ?
                    <div id="alertBox" className="alert-box-wrapper">

                        <ul className='mb-0' >

                            {alertArray.map((x, index) => (

                                <li style={{textAlign: 'center', position: modalOpen ? 'fixed' : 'initial', zIndex: 99999}} key={index} className={x.alertType == "success" ? "alert-list success list-unstyled" : "alert-list error list-unstyled"}>
                                    {this.update()}
                                    {x.alertMessage}
                                </li>

                            ))}
                        </ul>
                    </div> : null}
            </React.Fragment>
        )
    }

}

const mapStateProps = state => ({
    alertArray: state.common.alertArray,
    alertArrayLength:state.common.alertArrayLength,

})

export default connect(mapStateProps)(AlertComponent)
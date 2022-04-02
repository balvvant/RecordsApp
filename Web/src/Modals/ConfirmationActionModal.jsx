import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { changeBasketView } from '../actions/commonActions';
import { TEACH_NOW_TYPES } from "../Constants/types";
const ConfirmationActionModal = React.memo((props) => {
    const classes = useStyles();
    const addMore = () => {
        props.sendFile(TEACH_NOW_TYPES.EMAIL_TO_PATIENT, props.name)
    }
    const addToBasketFun = () => {
        props.sendFile(TEACH_NOW_TYPES.EMAIL_TO_PATIENT, props.name)
        changeBasketView(true);
    }

    return (
        <Modal showCloseIcon={false} classNames={{ modal: "modal-md modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center closeOnOverlayClick={true}>
            <div className="video-player-wrapper">
                {/* {props.description && <h3 className="font-20 primary-color">
                    {props.description}
                </h3>}

                {props.languages && props.languages.length > 1 && props.languageList && props.languageList.length > 0 &&
                    <div>
                        <h4 className="font-16 font-600 pt-1 pb-1" style={{ margin: 0 }}>{getResourceValue(props.resources, "CHOOSE_LANGUAGE")}</h4>
                        <Select
                            labelId="languages"
                            id="select_languuage"
                            value={props.selectedLan}
                            onChange={(ev) => props.onChangeLanguage(ev.target.value)}
                            label={getResourceValue(props.resources, "SELECT")}
                            name="language"
                            disableUnderline
                            classes={{ root: classes.selectRoot }}
                            style={{ position: 'relative', }}
                        >
                            <MenuItem disabled value=""><em>{getResourceValue(props.resources, "SELECT")}</em></MenuItem>
                            {props.languageList.map((data, index) => {
                                return props.languages.includes(data.language_id) ? (
                                    <MenuItem value={data.language_id} key={index}>{data.language_name}</MenuItem>
                                ) : null
                            })}
                        </Select>
                    </div>
                } */}
                <div className=" d-flex btn-wrapper justify-content-between">
                    <button type="button" onClick={() => addMore()} className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 text-uppercase mw-100">Add More</button>
                    <button type="submit" onClick={() => addToBasketFun()} className="btn full-width-xs btn-own btn-own-primary min-height-btn min-width-btn-md text-uppercase mw-100" >Go to basket</button>
                </div>
            </div>
        </Modal>

    )
})

const useStyles = makeStyles((theme) => ({
    selectRoot: {
        '&:focus': {
            backgroundColor: '#ffffff'
        }
    }
}));

 

export default ConfirmationActionModal;

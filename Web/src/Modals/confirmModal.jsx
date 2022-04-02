import { MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { getResourceValue } from '../Functions/CommonFunctions';
import { FromPage } from "../Constants/types";
const ConfirmationModal = React.memo((props) => {
    const classes = useStyles();
    const onProceed = () => {
        props.onCloseModal(true);
        // props.setSelectedLan(props.selectedLan);
    }
    return (
        <Modal showCloseIcon={false} classNames={{ modal: "modal-md modal-own" }} open={props.open} onClose={() => props.onCloseModal()} center showCloseIcon={false} closeOnOverlayClick={true}>
            <div className="video-player-wrapper">
                {props.description && <h3 className="font-20 primary-color">
                    {props.description}
                </h3>}

                {/* <div className="border-bottom-own pt-1 mb-1"></div> */}

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
                        {/* <div className="border-bottom-own pt-1 mb-1"></div> */}
                    </div>
                }
                <div className=" btn-wrapper">
                    <button type="button" onClick={() => props.onCloseModal(null)} className="btn full-width-xs-mb btn-own btn-own-grey min-height-btn min-width-btn-md mr-3 text-uppercase mw-100">{getResourceValue(props.resources, (props.from && props.from == FromPage.TEACHNOW) ? "CANCEL" : "NO")}</button>

                    <button type="submit" onClick={() => onProceed()} className="btn full-width-xs btn-own btn-own-primary min-height-btn min-width-btn-md text-uppercase mw-100" >{getResourceValue(props.resources, (props.from && props.from == FromPage.TEACHNOW) ? "PROCEED" : "YES")}</button>
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

export default ConfirmationModal;

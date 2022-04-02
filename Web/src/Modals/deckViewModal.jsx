import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from "react-redux";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { GLOBAL_API } from '../Constants/types';
import { getResourceValue } from "../Functions/CommonFunctions";
import { errorLogger } from "./../actions/commonActions";
const DeckViewModal = React.memo((props) => {
    const [currentIndex, setCurrentIndex] = useState([]);
    const [currentLanguage, setcurrentLanguage] = useState(0);
    const [deckFiles, setDeckFiles] = useState([]);
    const [attachment, setAttachment] = useState([]);
    const [langauges, setLangauges] = useState([]);
    const [deckName, setDeckName] = useState([]);
    const [reRender, setReRender] = useState(false);
    useEffect(() => {
        try {
            let files = [];
            let langauges = [];
            let index = [];

            props.data.content_files && props.data.content_files.length > 0 && props.data.content_files.forEach(file => {
                if (!files[file.language_id]) {
                    files[file.language_id] = [];

                    langauges.push(file.language_id);
                    index[file.language_id] = 0;
                }

                files[file.language_id].push({ ...file, file_path: file.file_path, ViewMode: true })
            })
            // files.sort((a, b) => (a.view_order - b.view_order));
            setDeckFiles(files)
            setLangauges(langauges);
            setCurrentIndex(index);

            let deckName = [];
            props.data.deck_details && props.data.deck_details.length > 0 && props.data.deck_details.forEach(deck => {
                deckName[deck.language_id] = deck.deck_name;
            })

            setDeckName(deckName);

            let attachment = [];
            props.data.deck_attachments && props.data.deck_attachments.length > 0 && props.data.deck_attachments.forEach(file => {
                attachment[file.language_id] = file;
            })

            setAttachment(attachment);

            setReRender(!reRender)
        } catch (error) {
            let errorObject = {
                methodName: "deckViewModal/useEffect",
                errorStake: error.toString(),
                history: props.history
            };

            errorLogger(errorObject);
        }
    }, [])
    const openPdfFiles = (path) => {
        window.open(`${GLOBAL_API}/${path}`)
    }

    const onRadioChange = (index, language_id) => {
        currentIndex[language_id] = index;

        setCurrentIndex(currentIndex);
        setReRender(!reRender)
    }

    const renderFiles = (item) => {
        let language_id = item.language_id;
        if (!langauges.includes(language_id)) {
            return null;
        }

        return (
            <div key={`div${language_id}`} className="row px-3 pb-3 language-box">
                <div className="col-md-12 col-12 px-0 pt-3">
                    <h5 className="font-16">{item.language_id + ' | ' + item.language_name}</h5>
                </div>
                <div className="col-md-3 col-12 px-0 ">

                    <div className="primary-color-bg-bar-left font-600">{deckName[language_id]} {getResourceValue(props.resources, "SLIDES")}</div>
                    <div className="py-3 alter-file-wrapper">
                        <Scrollbars style={{ height: 350 }} >
                            <div className="px-3 ">

                                <RadioGroup aria-label="gender" name={"file" + language_id} value={currentIndex[language_id] ? currentIndex[language_id] : 0} >
                                    {deckFiles && deckFiles[language_id] && deckFiles[language_id].length > 0 && deckFiles[language_id].map((file, index) => {
                                        return <FormControlLabel key={index + language_id} value={`img${index}`} control={<Radio onChange={(ev) => onRadioChange(index, language_id)} checked={index === currentIndex[language_id]} />} label={file.name} />
                                    }
                                    )}
                                </RadioGroup>
                            </div>

                        </Scrollbars>


                    </div>
                </div>
                <div className="col-md-9 col-12 px-0">
                    <div className="primary-color-bg-bar-right font-600">
                        {getResourceValue(props.resources, "PREVIEW")}
                    </div>
                    <div className="preview-img-wrapper d-flex flex-wrap align-items-center justify-content-center">
                        {deckFiles.length > 0 &&
                            <img src={`${GLOBAL_API}/${deckFiles[language_id][currentIndex[language_id]].file_path}`} alt="img" />}
                    </div>

                </div>
            </div>
        )
    }

    return (
        <Modal classNames={{ modal: "content-modal-lg modal-own" }}  open={props.open} onClose={() => props.onCloseModal()} center showCloseIcon={true} closeOnOverlayClick={true} closeIcon={''}>
            <div className="deck-view-wrapper">
                <div className="px-4 py-4">
                    {
                        props.languageList.map((language) => {
                            return renderFiles(language)
                        })
                    }
                </div>

            </div>
        </Modal>

    )
})



const mapStateToProps = (state) => ({
    languageList: state.common.languageList
});

export default connect(mapStateToProps)(DeckViewModal);

// export default DeckViewModal
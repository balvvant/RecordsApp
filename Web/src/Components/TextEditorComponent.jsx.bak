import { Editor } from '@tinymce/tinymce-react';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { CallApiAsync } from '../Functions/CommonFunctions';
import { API_METHODS, GLOBAL_API, TEXT_EDITOR_CONSTANTS, TINYMCE_API_KEY } from '../Constants/types';
const TextEditor = React.memo((props) => {
    const [editorData, setEditorData] = useState('');

    useEffect(() => {
        setEditorData(props.data);
    }, [props.data]);

    useEffect(() => {
        props.onChange(editorData);
    }, [editorData]);

    return (
        <div>
            <Editor
                apiKey={TINYMCE_API_KEY}
                onEditorChange={(value) => setEditorData(value)}
                value={editorData}
                init={{
                    icons: "jam",
                    skin: "fabric",
                    content_css: "document",
                    height : "350",
                    resize: true,
                    plugins: TEXT_EDITOR_CONSTANTS.PLUGINS,
                    toolbar: TEXT_EDITOR_CONSTANTS.TOOLBAR,
                    images_upload_handler: async function (blobInfo, success, failure) {
                        const formData = new FormData();
                        formData.append('file', blobInfo.blob(), blobInfo.filename());
                        let obj = {
                            method: API_METHODS.POST,
                            history: this.props.history,
                            api: '/upload-static-page-image',
                            body: formData
                        }
                        let res = await CallApiAsync(obj);
                        if(res.data.status == 200){
                            if(res.data.data.data){
                                let images = props.textEditorImages;
                                images.push({Key: res.data.data.data});
                                success(`${GLOBAL_API}/${res.data.data.data}`)
                            } else {
                                failure(res.data.status.toString());
                            }
                        } else {
                            failure(res.data.status.toString());
                        }
                    }
                }}
            />

        </div>

    )
})

const mapStateToProps = state => ({
    textEditorImages: state.common.textEditorImages
})

export default connect(mapStateToProps)(withRouter(TextEditor));
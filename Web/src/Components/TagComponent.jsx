import $ from 'jquery';
import React from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import { getResourceValue } from "../Functions/CommonFunctions";
import { errorLogger } from "../actions/commonActions";
import { resourceFields, resourceGroups } from "../Constants/types";
const KeyCodes = {
    comma: 188,
    enter: 13,
};


const delimiters = [KeyCodes.comma, KeyCodes.enter];
class TagComponent extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            tags: [],
            oldTag: [],
            newTag: [],
            errorTag: props.errorTag
        }
    }

    componentDidMount = () => {
        this.tagChange();
        if (this.props.editMode) this.setStateFromApi()
    }

    componentDidUpdate = () => {
        if (this.props.errorTag != this.state.errorTag && this.state.errorTag == "") {
            this.setState({ errorTag: this.props.errorTag });
        }
    }

    setStateFromApi = () => {
        try {
            if (this.props.from && this.props.from == resourceGroups.MANAGE_USERS) {
                if (this.props.dataVal) {
                    let localTags = this.props.dataVal;
                    let localTagsArray = [];
                    let localOldTags = []
                    localTags.forEach(element => {
                        localOldTags.push(element.id)
                    });
                    this.setState({
                        tags: localTags,
                        oldTag: localOldTags,

                    })

                }
            } else {
                if (this.props.dataVal && this.props.dataVal.search_tags) {
                    let localTags = this.props.dataVal.search_tags.split(',');
                    let localTagsArray = [];
                    let localOldTags = []
                    localTags.forEach(element => {
                        localTagsArray.push({ id: element, text: element })
                        localOldTags.push(element)

                    });
                    this.setState({
                        tags: localTagsArray,
                        oldTag: localOldTags,

                    })

                }
            }

        } catch (error) {
            let errorObject = {
                methodName: "tagUpload/setStateFromApi",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }
    tagChange = () => {
        try {
            setTimeout(() => {
                let searchTagwrapper = $('body .own-tag-wrapper .ReactTags__suggestions');
                let tagwrapper = $('body .own-tag-wrapper')
                if (searchTagwrapper && searchTagwrapper.length > 0) {
                    let suggestionsHeight = (searchTagwrapper)[0].clientHeight;
                    let suggestionsOffsetHeight = (tagwrapper)[0].getBoundingClientRect().top + window.scrollY;
                    let documentHeight = $(document).height();
                    if (documentHeight > ((180) + suggestionsOffsetHeight + 80)) {
                        $('body .own-tag-wrapper').addClass('move-top')
                    }
                }

            }, 100);
        } catch (error) {
            let errorObject = {
                methodName: "tagUpload/tagChange",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }

    }

    handleDelete = (i) => {
        try {
            const { tags } = this.state;
            let findEle = this.props.existingTab.findIndex(x => x.text === tags[i].text);
            if (findEle >= 0) {
                let localOldtag = [...this.state.oldTag];
                let newFindEle;
                if (this.props.from && this.props.from == resourceGroups.MANAGE_USERS) {
                    newFindEle = localOldtag.findIndex(x => x === tags[i].id);
                } else {
                    newFindEle = localOldtag.findIndex(x => x === tags[i].text);
                }



                localOldtag.splice(newFindEle, 1)
                this.setState({
                    oldTag: localOldtag
                })
            }
            else {
                let findEle = this.state.newTag.findIndex(x => x[0] === tags[i].text);
                let localNewtag = [...this.state.newTag];
                localNewtag.splice(findEle, 1)
                this.setState({
                    newTag: localNewtag
                })
            }

            this.setState({
                tags: tags.filter((tag, index) => index !== i),
            });
        } catch (error) {
            let errorObject = {
                methodName: "tagUpload/handleDelete",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }

    }

    handleAddition = (tag) => {
        try {
            let validateTag = false;
            this.setState({
                errorTag: ''
            });
            var containsNumber = /\d+/;
            var specailChar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            var variableChar = /[A-z]/;

            if (variableChar.test(tag.text)) {
                validateTag = true;
            }
            else {
                validateTag = false
                this.setState({
                    errorTag: getResourceValue(this.props.resources, 'FIELD_INVALID')
                });
                return false;
            }
            if (!specailChar.test(tag.text)) {
                validateTag = true;
            }
            else {
                validateTag = false
                this.setState({
                    errorTag: getResourceValue(this.props.resources, 'FIELD_INVALID')
                });
                return false;
            }
            if (!containsNumber.test(tag.text)) {
                validateTag = true;
            }
            else {
                validateTag = false
                this.setState({
                    errorTag: getResourceValue(this.props.resources, 'FIELD_INVALID')
                });
                return false;
            }


            if (validateTag) {
                let findEle = this.props.existingTab.find(x => x.text === tag.text);
                let localArray = [];
                if (findEle) {
                    if (this.props.from && this.props.from == resourceGroups.MANAGE_USERS) {
                        localArray.push(tag.id)
                    } else {
                        localArray.push(tag.text)
                    }
                    this.setState({
                        oldTag: [...this.state.oldTag, localArray]
                    })
                }
                else {
                    localArray.push(tag.text)
                    this.setState({
                        newTag: [...this.state.newTag, localArray]
                    })
                }

                this.setState(state => ({ tags: [...state.tags, tag] }));
            }

        } catch (error) {
            let errorObject = {
                methodName: "tagUpload/handleAddition",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }



    formValidation = async () => {
        this.setState({
            errorTag: ''
        })

        let formValidation = true;

        if (this.props.from && this.props.from == resourceGroups.UPLOAD_MEDIA) {
            if (this.state.tags.length <= 0) {
                formValidation = false;
                this.setState({
                    errorTag: getResourceValue(this.props.resources, 'FIELD_REQUIRED')
                })
            }
        }

        let tagMaxLength = getResourceValue(this.props.resources, "NEW_SERCH_TAG", resourceFields.Max_Length);
        if (this.state.newTag.length > 0) {
            for (let i = 0; i < this.state.newTag.length; i++) {
                let tag = this.state.newTag[i][0]
                if (tag.length > tagMaxLength) {
                    formValidation = false;
                    this.state.newTag[i].error = getResourceValue(this.props.resources, 'FIELD_LENGTH').replace('{max_length}', tagMaxLength)
                } else {
                    this.state.newTag[i].error = '';
                }
            }
            let errorItem = this.state.newTag.find((el) => el.error != '');

            if (errorItem) {
                formValidation = false;
                this.setState({ errorTag: getResourceValue(this.props.resources, 'FIELD_LENGTH').replace('{max_length}', tagMaxLength) })
            } else {
                this.setState({ errorTag: '' })
            }
        }

        return {
            formValidation: formValidation, data: {
                oldTag: this.state.oldTag,
                newTag: this.state.newTag,
            }
        }
    }



    render() {
        const { tags } = this.state;

        let col = "";

        if (this.props.from && this.props.from == resourceGroups.MANAGE_USERS) {
            col = "";
        } else {
            if (this.props.editMode) {
                col = "col-lg-9";
            } else {
                col = "col-lg-6";
            }
        }

        return (
            <>

                {(this.props.from && this.props.from == resourceGroups.MANAGE_USERS) ? null : <p className="font-12 mb-10 cpl-10 cpr-10">{this.props.formNumber == '07' ? this.props.tagLABEL : ''}{this.props.formNumber == '06' ? this.props.tagLABEL.replace('07', '06') : ''}</p>}


                <div className="row m-0 p-0">
                    <div className={` position-relative col-12 ${col} ${this.props.from == resourceGroups.UPLOAD_MEDIA ? 'cpl-10 cpr-10' : 'p-0'}`}>
                        <div className="own-tag-wrapper" style={(this.props.from && this.props.from == resourceGroups.MANAGE_USERS) ? { zIndex: 5 } : {}} >

                            <ReactTags
                                tags={this.state.tags}
                                placeholder={getResourceValue(this.props.resources, "NEW_SERCH_TAG")}
                                suggestions={this.props.existingTab}
                                handleDelete={this.handleDelete}
                                handleAddition={this.handleAddition}
                                // handleInputChange={this.tagChange}
                                allowDragDrop={false}
                                renderSuggestion={({ text }, query) => <div>{text}</div>}
                                autofocus={false}
                                minQueryLength={0}
                            />
                        </div>
                        <div className="error-wrapper">
                            {this.state.errorTag}
                        </div>
                    </div>
                </div>

            </>

        );
    }
}

export default TagComponent;

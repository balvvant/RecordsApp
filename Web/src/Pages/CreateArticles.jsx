import { format } from 'date-fns';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS,CONSTANTS, BUTTON_TYPES, resourceGroups } from "../Constants/types";
import AddEditArticleModal from '../Modals/AddEditArticleModal';
import CustomTableComponent from "../Components/CustomTableComponent";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';

class CreateArticles extends Component {

    constructor(props) {
        super(props);
        this.state = {
            addEditArticleList: false,
            currentActiveData: null,
            editMode: false,
            adminResources: [],
            languageId: props.languageId,
            pageSize: 25,
            currentPage: 1,
            searchVal: '',
            sortColName: '',
            sortType: true,
            dataArray: [],
            totalDocument: null,
            columnArray: []
        }
    }

    componentDidMount = () => {
        this.viewArticle()
        this.getAdminResources();
    }
    componentDidUpdate = () => {
        const { languageId } = this.props;
        if (languageId !== this.state.languageId) {
            this.setState({ languageId: languageId }, () => { this.getAdminResources() });
        }
    }

    getAdminResources = async () => {
        try {

            globalLoader(true);
            //get language data
            let languageId = this.state.languageId;

            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-page-resources',
                body: {
                    group_id: [resourceGroups.UPLOAD_MEDIA, resourceGroups.MENU_GROUPS, resourceGroups.MENUS, resourceGroups.FOOTER_MENU_HEADER_GROUPS, resourceGroups.WEBSITE_MENU, resourceGroups.LANGUAGE_RESOURCES, resourceGroups.ARTICLE],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === 200) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ adminResources: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
            }
            let columnArray = [

                {
                    databaseColumn: 'place_holder_value',
                    columnName: getResourceValue(this.state.adminResources, 'ARTICLE_HEADING'),
                    isSort: false,
                    width: '50%'
                },
                {
                    databaseColumn: 'author_name',
                    columnName: getResourceValue(this.state.adminResources, 'AUTHOR'),
                    isSort: false,
                    width: '10%'
                },
                {
                    databaseColumn: 'created_at',
                    columnName: getResourceValue(this.state.adminResources, 'ARTICLE_ADDED_ON'),
                    isSort: false,
                    width: '10%'
                },
            ];

            this.setState({ columnArray: columnArray });

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "adminconfiguration/getAdminResources",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    viewArticle = async () => {
        try {
            globalLoader(true)
            let obj = {
                method: API_METHODS.POST,
                history: this.props.history,
                api: '/get-articles',
                body: {
                    view_records: this.state.pageSize,
                    view_page: this.state.currentPage,
                    search_string: this.state.searchVal && this.state.searchVal,
                    sort_col_name: this.state.sortColName && this.state.sortColName,
                    sort_col_type: this.state.sortType ? "ASC" : "DESC",
                }
            }
            let articleResult = await CallApiAsync(obj);
            if (articleResult.data.status === 200) {
                let count = articleResult.data.data.totalCount;

                let articlesData = [];
                if (articleResult.data.data.articles && articleResult.data.data.articles.length > 0) {
                    for (let articles of articleResult.data.data.articles) {
                        let newArticles = Object.create(articles);
                        if (articles.created_at) {
                            newArticles.created_at = format(new Date(articles.created_at), "dd-MM-yyyy");
                        }
                        articlesData.push(newArticles);
                    }
                }


                this.setState({
                    dataArray: articlesData,
                    totalDocument: count,
                }, () => {
                    globalLoader(false)
                })
            }

            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, articleResult.data.status.toString()))
                this.setState({
                    dataArray: [],
                    totalDocument: null,
                }, () => {
                    globalLoader(false)
                })
            }
        } catch (error) {
            let errorObject = {
                methodName: "websiteMenu/viewArticle",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    closeaddEditArticleListModal = (val) => {
        if (val) {
            this.setState({
                addEditArticleList: false,
                currentActiveData: null,
                editMode: false,
            }, () => {
                this.viewArticle()
            })
        }
        else {
            this.setState({
                addEditArticleList: false,
                currentActiveData: null,
                editMode: false,
            })
        }
    }
    openaddEditArticleListModal = () => {
        this.setState({
            addEditArticleList: true
        })
    }

    openEditArticleListFunc = (blogId) => {
        try {
            let localCurrentActiveData = this.state.dataArray.find(x => x.blog_id === blogId);
            this.setState({
                currentActiveData: localCurrentActiveData,
                editMode: true,
            }, () => {
                this.setState({
                    addEditArticleList: true,
                })
            })
        } catch (error) {
            let errorObject = {
                methodName: "article/openEditArticleListFunc",
                errorStake: error.toString(),
                history:this.props.history
            };
            errorLogger(errorObject);
        }
    }

    searchFilter = (ev) => {
        ev.preventDefault();
        this.viewArticle()
    }

    sortingTable = (val) => {
        if (val === this.state.sortColName) {
            this.setState((prevState => ({
                sortType: !prevState.sortType,
                currentPage: 1,
            }

            )), () => {
                this.viewArticle()
            })
        }
        else {
            this.setState({
                sortColName: val,
                sortType: true,
                currentPage: 1,
            }, () => {
                this.viewArticle()
            })
        }
    }

    changePageSize = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value,
            currentPage: 1,
        }, () => {
            this.viewArticle()
        })
    }

    changeValue = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value
        })
    }

    resetApiVal = () => {
        this.setState({
            pageSize: 25,
            currentPage: 1,
            searchVal: '',
            sortColName: '',
            sortType: true,
        }, () => {
            this.viewArticle()
        })
    }

    goToPage = (ev, val) => {
        try {
            if (ev) {
                this.setState({
                    currentPage: ev.target.value
                }, () => {
                    this.viewArticle()
                })
            }
            else {
                if (val === 'next') {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage + 1
                    }

                    )), () => {
                        this.viewArticle()
                    })
                }
                else if (val === 'prev') {
                    this.setState((prevState => ({
                        currentPage: prevState.currentPage - 1
                    }

                    )), () => {
                        this.viewArticle()
                    })
                }
            }
        } catch (error) {
            let errorObject = {
                methodName: "websiteMenu/goToPage",
                errorStake: error.toString(),
                history:this.props.history
            };

            errorLogger(errorObject);
        }
    }

    render() {

        return (

            <div className="">
                <div className="content-container mb-10">
                    <CustomTableComponent
                        buttons={[
                            {
                                text: `+ ${getResourceValue(this.state.adminResources, 'ADD_NEW')}`,
                                onClick: () => this.openaddEditArticleListModal(),
                                type: BUTTON_TYPES.PRIMARY
                            },
                        ]}

                        showCheckbox={true}
                        showSearchBar={true}
                        showTitle={true}
                        showFilter={true}

                        resources={this.state.adminResources}
                        sortingTable={this.sortingTable}
                        allChecked={this.state.allChecked}
                        totalUserId={this.state.totalUserId}
                        dataArray={this.state.dataArray}

                        openEditUserModalFunc={this.openEditArticleListFunc}
                        sortObj={{
                            sortVal: this.state.sortColName,
                            sortType: this.state.sortType,
                        }}

                        columnArray={this.state.columnArray}
                        tableTitle={getResourceValue(this.state.adminResources, 'ARTCILE')}

                        primaryKey={'blog_id'}
                        pageSize={this.state.pageSize}
                        goToPage={this.goToPage}
                        totalCount={this.state.totalDocument}
                        currentPage={this.state.currentPage}
                        inputLabel={getResourceValue(this.state.adminResources, 'SHOW_PER_PAGE')}
                        pageCount={getResourceValue(this.state.adminResources, 'PAGE_COUNT')}
                        changePageSize={this.changePageSize}
                        searchVal={this.state.searchVal}
                        changeValue={this.changeValue}
                        searchFilter={this.searchFilter}
                        viewBasicApi={this.viewArticle}
                    />
                </div>
                {this.state.addEditArticleList ?
                    <AddEditArticleModal
                        editMode={this.state.editMode}
                        currentData={this.state.currentActiveData}
                        closeCallBackOption={this.viewArticleApi}
                        open={true}
                        onCloseModal={this.closeaddEditArticleListModal}
                        resources={this.state.adminResources}
                    /> : null}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    languageId: state.common.languageId
})
export default connect(mapStateToProps)(withRouter(CreateArticles));
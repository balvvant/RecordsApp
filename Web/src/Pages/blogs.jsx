import {
    FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select
} from "@material-ui/core";
import format from "date-fns/format";
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { errorLogger, globalAlert, globalLoader } from '../actions/commonActions';
import { API_METHODS, GLOBAL_API, PAGE_ENTRY_SIZE,CONSTANTS,STATUS_CODES, resourceGroups } from "../Constants/types";
import { CallApiAsync, getResourceValue } from '../Functions/CommonFunctions';
import { LeftArrow, RightArrow } from "../Constants/svgIcons";
class Blogs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addEditArticleList: false,
            currentActiveData: null,
            editMode: false,
            adminResources: [],
            pageSize: 25,
            currentPage: 1,
            searchVal: '',
            sortColName: '',
            sortType: true,
            dataArray: [],
            totalDocument: null,
            detailBlog: {},
            openComponent: false,
            isPrevEnable: false,
            isNextEnable: false,
            lastPage: 0,
            goToPage: [],
        }
    }

    componentDidMount = () => {
        this.getAdminResources();
        this.viewArticle();
    }

    componentDidUpdate = () => {
        // if(this.state.openComponent != this.props.openComponent){
        //     this.setState({openComponent: this.props.openComponent});
        // }
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
                    group_id: [resourceGroups.ARTICLE],
                    common: true,
                }
            }
            let resourcesResult = await CallApiAsync(obj);

            if (resourcesResult.data.status === STATUS_CODES.OK) {
                let resources = resourcesResult.data.data.resources;
                this.setState({ adminResources: resources });
            }
            else {
                globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, resourcesResult.data.status.toString()));
            }

            globalLoader(false);
        }
        catch (error) {
            let errorObject = {
                methodName: "adminconfiguration/getAdminResources",
                errorStake: error.toString(),
                history: this.props.history
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

            if (articleResult.data.status === STATUS_CODES.OK) {
                let count = articleResult.data.data.totalCount;

                // if (count <= 0) {
                //     globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.adminResources, 'NO_RECORDS'));
                // }

                let lastPage = Math.ceil(count / this.state.pageSize);
                let isPrevEnable = !(this.state.currentPage < 2);
                let isNextEnable = (this.state.currentPage < lastPage);
                let totalDropdownItem = [];
                for (let index = 1; index <= lastPage; index++) {
                    totalDropdownItem.push(index)
                }

                this.setState({ goToPage: totalDropdownItem, lastPage: lastPage, isPrevEnable: isPrevEnable, isNextEnable: isNextEnable });

                this.setState({
                    dataArray: articleResult.data.data.articles,
                    totalDocument: count,
                }, () => {
                    globalLoader(false);
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
                history: this.props.history
            };
            errorLogger(errorObject);
        }
    }

    searchFilter = (ev) => {
        ev.preventDefault();
        this.viewArticle()
    }
    changePageSize = (ev) => {
        this.setState({
            [ev.target.name]: ev.target.value,
            currentPage: 1,
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
                history: this.props.history
            };

            errorLogger(errorObject);
        }
    }


    render() {
        let token = localStorage.getItem("token");
        return (
            <div className={token ? "content-container" : "header-container landing-header-container blog-header-container"} style={token ? {padding: '10px'} : {}} >
                <div className="header-fix-strap" id="strapHeader" >
                    {
                        !this.state.openComponent &&
                        <>
                            <div className="d-flex justify-content-end mt-20">
                                <div className="d-flex flex-row">
                                    {this.state.totalDocument > 25 &&
                                        <div className="ml-10">
                                            <FormControl variant="outlined">
                                                <InputLabel id="show_per_page">{getResourceValue(this.state.adminResources, "SHOW_PER_PAGE")}</InputLabel>
                                                <Select
                                                    labelId="show_per_page"
                                                    id="demo-simple-select-outlined"
                                                    value={this.state.pageSize}
                                                    onChange={(ev) => this.changePageSize(ev)}
                                                    label={getResourceValue(this.state.adminResources, "SHOW_PER_PAGE")}
                                                    name="pageSize"
                                                    style={{ width: '120px' }}
                                                >
                                                    {PAGE_ENTRY_SIZE && PAGE_ENTRY_SIZE.length > 0 && PAGE_ENTRY_SIZE.map((data, index) => (
                                                        <MenuItem value={data.value} key={index}>{data.value}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                    }
                                    <div className="ml-10">
                                        <form
                                            className="form-own form-auto-height"
                                            noValidate
                                            autoComplete="off"
                                            onSubmit={(ev) => this.searchFilter(ev)}
                                        >
                                            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                                                <OutlinedInput
                                                    id="standard-adornment-amount"
                                                    name="searchVal"
                                                    onChange={(ev) => this.setState({
                                                        searchVal: ev.target.value
                                                    })}
                                                    value={this.state.searchVal}
                                                    variant="outlined"
                                                    startAdornment={<InputAdornment position="start"><i className="fa fa-search" aria-hidden="true" ></i></InputAdornment>}
                                                    placeholder={getResourceValue(this.state.adminResources, "SEARCH")}
                                                    style={{ background: '#F4F4F4', width: '200px' }}
                                                />
                                            </FormControl>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                    <div className="logo-wrapper" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', padding: '0px' }}>
                        {!this.state.openComponent ?
                            <>
                                <ul className="blog-post columns-2" style={{ marginBottom: '5px' }}>
                                    {this.state.dataArray &&
                                        this.state.dataArray.length > 0 &&
                                        this.state.dataArray.map((data) => {
                                            return (
                                                <a onClick={() => this.setState({ openComponent: true, detailBlog: data })} href={`#`}>
                                                    <li>
                                                        {
                                                            data.image_name ?
                                                                <>
                                                                    <div className='col-md-2 blog-left'>
                                                                        <img src={`${GLOBAL_API}/${data.image_name}`} />
                                                                    </div>
                                                                    <div className='col-md-10'>
                                                                        <h3>{data.place_holder_value}</h3>
                                                                        <p>{data.info_value}</p>
                                                                    </div>
                                                                </>
                                                                :
                                                                <div className='col-md-12'>
                                                                    <h3>{data.place_holder_value}</h3>
                                                                    <p>{data.info_value}</p>
                                                                </div>
                                                        }
                                                    </li>
                                                </a>
                                            )
                                        })
                                    }
                                </ul>
                            </>

                            :
                            <article class="content">
                                <h3 className='my-4 text-center'>{this.state.detailBlog.place_holder_value}</h3>
                                {
                                    this.state.detailBlog.image_name &&
                                    <img src={`${GLOBAL_API}/${this.state.detailBlog.image_name}`} alt='large-image' class="poster-image" />
                                }

                                <p className='blog-para' dangerouslySetInnerHTML={{ __html: this.state.detailBlog.resource_value }}></p>
                                <div className='bottom-blog'>
                                    <div>
                                        {
                                            this.state.detailBlog.author_name &&
                                            <p className='author-label'>By <span className='blog-created-date'>{this.state.detailBlog.author_name}</span></p>
                                        }
                                        <p className='blog-created-label'>On <span className='blog-created-date'> {format(new Date(this.state.detailBlog?.created_at), "dd-MM-yyyy")}</span></p>
                                    </div>
                                </div>
                            </article>
                        }
                    </div>
                    {
                        !this.state.openComponent && <>
                            {this.state.pageSize < this.state.totalDocument &&
                                <div className="cusPaginationFooter" >
                                    <div className="cusPagination p-0">
                                        {
                                            this.state.isPrevEnable ? <a href="#" onClick={() => this.goToPage(null, 'prev')} ><LeftArrow /></a> : <p className='m-0 disabled'><LeftArrow /></p>
                                        }
                                        <p className="pageNum mb-0">{getResourceValue(this.state.adminResources, 'PAGE')}  <span>{(this.state.currentPage)}</span> {getResourceValue(this.state.adminResources, 'OF').toUpperCase()} <span>{this.state.lastPage}</span></p>
                                        {
                                            this.state.isNextEnable ? <a href="#" onClick={() => this.goToPage(null, 'next')} ><RightArrow /></a> : <p className='m-0 disabled'><RightArrow /></p>
                                        }
                                        <div>
                                            <div className="d-md-inline-flex" style={{ alignItems: 'center' }}>
                                                <div className="pageNum d-none d-md-inline-flex"> {getResourceValue(this.state.adminResources, "JUMP_TO_PAGE")} </div>
                                                <FormControl variant="outlined">
                                                    <Select
                                                        labelId="JUMP_TO_PAGE"
                                                        id="demo-simple-select-outlined"
                                                        value={this.state.currentPage}
                                                        onChange={(ev) => this.goToPage(ev, 'jump')}
                                                        name="jumpToPage"
                                                    >
                                                        {this.state.goToPage && this.state.goToPage.length > 0 && this.state.goToPage.map((data, index) => (
                                                            <MenuItem value={data} key={index}>{data}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </>
                    }
                </div>
            </div>
        )
    }
}

export default withRouter(Blogs);
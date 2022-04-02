import { FormControl, InputAdornment, MenuItem, OutlinedInput, Select} from "@material-ui/core";
import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { changeContentBasket, changeGlobalRender,changeViewType, errorLogger, globalAlert, globalLoader} from "../actions/commonActions";
import { API_METHODS, CONTENT_DATA_TYPES, CONTENT_FILTER_TYPES, CONTENT_TYPE, CONTENT_VIEW_TYPES,CONSTANTS, DashboardStatus, resourceGroups, PATIENT_USERS } from "../Constants/types";
import { FavIcon, FillFavIcon, DECKIcon, PDFIcon, RibbonIcon, VideoIcon } from "../Constants/svgIcons";
import DeckModal from "../Modals/deckModal";
import SendMediaModal from '../Modals/sendMediaModal';
import ConfirmationModal from '../Modals/confirmModal';
import { CallApiAsync, getLanguageName, getOrg, getResourceValue, logOut } from "../Functions/CommonFunctions";
import { appstore } from '../store/index';

class SendContent extends Component {
  constructor(props) {
    super(props);
    const patient_detail = localStorage.getItem('patient_detail');
    this.state = {
      resources: [],
      languageId: props.languageId,
      basketIds: [],
      tabs: [],
      currentTab: CONTENT_VIEW_TYPES.ORIGINAL,
      masterBucketContents: [],
      contents: [],
      attachments: [],
      removeBasketContent: null,
      basketContents: props.contentBaskets,
      searchString: '',
      resources: [],
      patient_detail: JSON.parse(patient_detail),
      nhs_number_text: '',
      realDate: '',
      deckModal: false,
      selectedContent: {},
      categoryId: props.categoryId,
      parentCategoryId: props.parentCategoryId,
      orgId: props.orgId?.organization_id,
      categoryType: props.categoryType,
      contentFilterType: props.contentFilterType,
      contentViewType: props.contentViewType,
      showCategories: props.showCategories,
      sendNowModal: false,
      confirmModalOpen: false,
    }
  }

  componentDidMount = () => {
    this.getResource();
    let org = getOrg();
    if (org?.organization_id) {
      //this.fetchCategories();
      this.fetchPatients();
    }
  }

  componentDidUpdate(prevProps) {

    const { languageId, categoryId, parentCategoryId, orgId, categoryType, contentFilterType, contentBaskets, contentViewType, showCategories } = this.props;

    if (contentBaskets.length != this.state.masterBucketContents.length) {
      this.setState({ masterBucketContents: contentBaskets, basketContents: contentBaskets });
    }

    if (languageId !== this.state.languageId) {
      this.setState({ languageId: languageId }, () => { this.getResource() });
    }

    let fetchContent = false;
    if (categoryId != this.state.categoryId) {
      fetchContent = true;
    }
    if (showCategories != this.state.showCategories) {
      if (showCategories) {
        fetchContent = true;
      }
    }
    if (parentCategoryId != this.state.parentCategoryId) {
      fetchContent = true;
    }

    if (orgId?.organization_id != this.state.orgId) {
      fetchContent = true;
    }

    if (contentFilterType != this.state.contentFilterType) {
      fetchContent = true;
    }

    if (contentViewType != this.state.contentViewType) {
      fetchContent = true;
    }

    if (this.props?.orgId?.organization_id != prevProps?.orgId?.organization_id) {
      this.fetchCategories();
      this.fetchPatients();
      fetchContent = true;
    }

    if (fetchContent) {
      this.setState({ categoryId: categoryId, parentCategoryId: parentCategoryId, orgId: orgId?.organization_id, contentFilterType: contentFilterType, contentViewType: contentViewType, showCategories: showCategories }, () => this.fetchContent())
    }
  }

  fetchPatients = async () => {
    let obj = {
      method: API_METHODS.POST,
      history: this.props.history,
      api: '/get-all-patients',
      body: {}
    }
    let patientResult = await CallApiAsync(obj);
    if (patientResult.data.status == 200) {
        appstore.dispatch({
            type: PATIENT_USERS,
            payload: patientResult.data.data.patients,
        })
    }
  }

  fetchCategories = async () => {
    try {
      globalLoader(true);
      if (localStorage.getItem('token')) {
        let obj = {
          method: API_METHODS.GET,
          history: this.props.history,
          api: '/get-content-categories',
          body: {}
        }
        await CallApiAsync(obj);
        if (this.state.parentCategoryId) {
          this.fetchContent();
        }
      } else {
        logOut(this.props.history, `/`)
      }
      if (this.props.showBasketView) {
        globalLoader(false);
      }
    } catch (error) {
      let errorObject = {
        methodName: "layout/basicApiCall",
        errorStake: error.toString(),
        history: this.props.history
      };
      errorLogger(errorObject);
    }
  }

  getResource = async () => {
    try {
      // globalLoader(true);

      //get language data
      let languageId = this.state.languageId;

      let obj = {
        method: API_METHODS.POST,
        history: this.props.history,
        api: '/get-page-resources',
        body: {
          group_id: [resourceGroups.CLINICIAN_DASHBOARD, resourceGroups.COMMON, resourceGroups.UNLOCK_DECK, resourceGroups.PATIENT_DASHBOARD, resourceGroups.FEATURE_MENU, resourceGroups.CREATE_PROFILE]
        }
      }

      let resourcesResult = await CallApiAsync(obj);

      if (resourcesResult.data.status === 200) {
        let resources = resourcesResult.data.data.resources;

        let tabs = [
          {
            name: getResourceValue(resources, CONTENT_VIEW_TYPES.ORIGINAL),
            value: CONTENT_VIEW_TYPES.ORIGINAL
          },
          {
            name: getResourceValue(resources, CONTENT_VIEW_TYPES.FAVORITES),
            value: CONTENT_VIEW_TYPES.FAVORITES
          }
        ];

        this.setState({ resources: resources, tabs: tabs });
      }
      else {
        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, resourcesResult.data.status.toString()));
      }


      // globalLoader(false);
    }
    catch (error) {
      let errorObject = {
        methodName: "_loggedInLayout/getResource",
        errorStake: error.toString(),
        history: this.props.history
      };

      errorLogger(errorObject);
    }
  }

  fetchContent = async () => {
    try {
      if(this.props.parentCategoryId > 0) {
        globalLoader(true);
        let obj = {
          method: API_METHODS.POST,
          history: this.props.history,
          api: '/get-contents',
          body: {
            search_string: this.state.searchString,
            parent_category_id: this.props.parentCategoryId,
            filter_type: this.state.contentFilterType,
            view_type: this.state.contentViewType
          }
        }

        if(!this.state.categoryId) {
          obj.body.content_data_type = CONTENT_DATA_TYPES.ALL_CONTENT;
        } else {
            obj.body.categories = this.state.categoryId?.toString();
        }

        // if (typeof this.state.categoryId == 'string' && this.state.categoryId?.includes(CONTENT_DATA_TYPES.ALL_CONTENT + this.props.parentCategoryId)) {
        //   obj.body.content_data_type = CONTENT_DATA_TYPES.ALL_CONTENT;
        // } else if (this.state.categoryId == CONTENT_DATA_TYPES.FEATURED) {
        //   obj.body.content_data_type = CONTENT_DATA_TYPES.FEATURED;
        // } else {
        //   obj.body.categories = this.state.categoryId?.toString();
        // }
        let contentApiResponse = await CallApiAsync(obj);
        if (contentApiResponse.data.status == 200) {
            let contentsData = contentApiResponse.data.data.contents;
            if (contentsData && contentsData.length > 0) {
              let contents = [];
              for (let content of contentsData) {
                let newContent = Object.create(content);
                let contentData = [];
                let defaultLanguageId = 0;
                for (let langId of newContent.languages) {
                  if (!defaultLanguageId) {
                    defaultLanguageId = langId;
                  }
                  if (newContent.content_data.length > 0) {
                    let deckDetail = newContent.content_data.find(e => e.language_id == langId);
                    if (deckDetail) {
                      contentData[langId] = deckDetail
                    }
                  }
                }
                newContent.content_data = contentData;
                newContent.default_language_id = defaultLanguageId;
                contents.push(newContent);
              }
              this.setState({ contents: contents });
              if (this.state.attachments.length == 0) {
                this.setState({ attachments: contents });
              }
            }
            else {
              this.setState({ contents: [] })
            }
          
        } else {
          this.setState({ contents: [] })
          globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, contentApiResponse.data.status.toString()));
        }
      }
      globalLoader(false);
    }
    catch (error) {
      let errorObject = {
        methodName: "_loggedInLayout/fetchContent",
        errorStake: error.toString(),
        history: this.props.history
      };

      errorLogger(errorObject);
    }
  }

  setFavouriteToggle = async (val, e = null) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      globalLoader(true);
      let obj = {
        method: API_METHODS.POST,
        history: this.props.history,
        api: '/mark-unmark-favorite-content',
        body: {}
      }

      if (val.clinician_content_id) {
        obj.body.clinician_content_id = val.clinician_content_id;
      } else {
        obj.body.content_id = val.content_id;
      }

      let res = await CallApiAsync(obj);
      if (res.data.status === 200) {
        globalAlert("success", getResourceValue(this.state.resources, res.data.status.toString()));
        this.fetchContent();
      } else {
        globalAlert(CONSTANTS.ERROR, getResourceValue(this.state.resources, res.data.status.toString()));
        globalLoader(false);
      }
      this.setState({ deckModal: false });
    } catch (error) {
      let errorObject = {
        methodName: "_loggedInLayout/setFavouriteToggle",
        errorStake: error.toString(),
        history: this.props.history
      };
      errorLogger(errorObject);
    }
  };

  renderContentTypeIcon = (type) => {
    if (type == CONTENT_TYPE.DECK) {
      return <DECKIcon width={"40px"} height={"40px"} />
    } else if (type == CONTENT_TYPE.VIDEO) {
      return <VideoIcon width={"40px"} height={"40px"} />
    } else if (type == CONTENT_TYPE.FILE) {
      return <PDFIcon width={"40px"} height={"40px"} />
    }
  }

  renderContentTitle = (content) => {
    let defaultLanguageId = localStorage.getItem('default_language_id');
    if (content.modified) {
      return content.content_title;
    } else {
      if (content.content_data[this.state.languageId]) {
        return content.content_data[this.state.languageId].content_title;
      } else if (content.content_data[defaultLanguageId]) {
        return content.content_data[defaultLanguageId].content_title;
      } else {
        return content.content_data[content.default_language_id].content_title;
      }
    }
  }

  showLanguages = (content) => {
    if (content.languages) {
      let langName = content.languages.map((langauge) => {
        return getLanguageName(langauge, this.props.languageList)
      });
      return langName.join(" | ");

    } else if (content.language_id) {
      return getLanguageName(content.language_id, this.props.languageList)
    }
  }

  changeBasket = (content, e = null) => {
    if (e) {
      e.stopPropagation();
    }
    let bIds = this.state.basketContents;
    let contentIndex = this.isAddedInBasket(content);
    if (contentIndex >= 0) {
      bIds.splice(contentIndex, 1);
    } else {
      bIds.push(content);
    }
    changeContentBasket(bIds);
    changeGlobalRender(!this.props.reRender);
    this.setState({ reRender: !this.state.reRender });
  }

  isAddedInBasket = (content) => {
    let bIds = this.state.basketContents;
    return bIds.findIndex(e => e.content_id == content.content_id && e.clinician_content_id == content.clinician_content_id && e?.modified == content.modified);
  }

  openContent = (content) => {
    this.setState({ deckModal: true, selectedContent: content });
  }

  removeBasketContent = (content, e = null) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ deckModal: false, confirmModalOpen: true, removeBasketContent: content })
  }

  getCategoryName = () => {
    if (this.props.userCategories && this.props.userCategories.length > 0) {
      let parentCategory = this.props.userCategories.find(e => e.parent_category_id == this.state.parentCategoryId);
      if (parentCategory) {
        let childCategory = parentCategory.categories.find(e => e.category_id == this.state.categoryId);
        if (childCategory) {
          if (childCategory.category_name == CONTENT_DATA_TYPES.ALL_CONTENT || childCategory.category_name == CONTENT_DATA_TYPES.FEATURED) {
            return getResourceValue(this.state.resources, childCategory.category_name);
          }
          return childCategory.category_name;
        }
      }
    }
    return null;
  }

  renderContents = () => {
    let contents = this.props.showBasketView ? this.state.basketContents : this.state.contents;
    if (contents && contents.length > 0) {
      return contents.map((content, index) => {
        let contentTitle = this.renderContentTitle(content);
        return (
          <div key={`content_${index}`} className="col-lg-3 p-0 m-0 cursor" onClick={() => this.openContent(content)}>
            <div className='content-card' style={{ marginLeft: index % 4 == 0 ? '0px' : '10px' }} >
              <div className='content-sub-card' >
                <div className='content-icon-container'>
                  <div>
                    {!this.props.showBasketView && <div onClick={(e) => this.setFavouriteToggle(content, e)} >{content.favorite ? <FillFavIcon /> : <FavIcon />}</div>}
                  </div>
                  <div style={{ marginTop: this.props.showBasketView ? '-12px' : '-18px', }}>
                    <div>{content.is_featured ? <RibbonIcon /> : null}</div>
                  </div>
                </div>
                <div className='content-card-icon' style={{ marginTop: this.props.showBasketView ? '-5px' : '-25px' }}>
                  {this.renderContentTypeIcon(content.content_type_key)}
                </div>
                {
                  this.props.contentFilterType == CONTENT_FILTER_TYPES.FOR_PATIENTS && <>
                    {
                      this.isAddedInBasket(content) >= 0 ? <div className='content-basket-container active cursor' onClick={(e) => this.removeBasketContent(content, e)}>
                        <p className='content-basket-text active m-0'>{getResourceValue(this.state.resources, "REMOVE_FROM_BASKET")}</p>
                      </div>
                        : <div className='content-basket-container cursor' onClick={(e) => this.changeBasket(content, e)}>
                          <p className='content-basket-text m-0'> + {getResourceValue(this.state.resources, "ADD_TO_BASKET")}</p>
                        </div>
                    }
                  </>
                }


              </div>
              <p title={contentTitle} className='content-title m-0' >{contentTitle}</p>
              {content.description && <p title={content.description} className='content-description m-0' >{content.description}</p>}
              <p className='content-language m-0' >{this.showLanguages(content)}</p>
            </div>
          </div>
        )
      });
    } else {
      return <>
        {
            this.props.showBasketView ? 
                <div className="no-table-data cmt-10">{getResourceValue(this.state.resources, 'NO_ITEMS_ADDED')}</div>
            : <div className="no-table-data cmt-10">{getResourceValue(this.state.resources, 'NO_RECORDS')}</div>
        }
      </>
    }
  }

  onConfirmCloseModalFunc = (val) => {
    if (val) {
      this.changeBasket(this.state.removeBasketContent)
    }
    this.setState({ confirmModalOpen: false });
  }

  searchFilter = (ev) => {
    ev.preventDefault();
    if (this.props.showBasketView) {
      let searchString = this.state.searchString.toLowerCase();
      let content = this.props.contentBaskets;
      let filteredData = content.filter(e => {
        return (this.renderContentTitle(e).toLowerCase().includes(searchString) || e.description?.toLowerCase().includes(searchString))
      });
      this.setState({ basketContents: filteredData });
    } else {
      this.fetchContent();
    }
  }

  render() {
    return (
      <>
        <div className="sidebar-container">
          <div className="container cpt-10 cpb-10 cpl-10 cpr-10" style={{ maxWidth: '100%' }}>
            <div className={`right-content-wrapper`} >
              <div className=''>
                <div className="row col-12 p-0 m-0">
                  <div className="col-lg-3 p-0 m-0">
                    {this.props.showBasketView ?
                      <><div class="col-lg-12 p-0 m-0"><p class="category-header m-0">{getResourceValue(this.state.resources, "BASKET_CONTENT")}</p></div>
                      </>
                      : <p className="category-header m-0" >{this.getCategoryName()}</p>}
                  </div>
                  <div className="col-lg-9 p-0 m-0 d-flex justify-content-end align-items-center">
                    {
                      !this.props.showBasketView && <>
                        <div className="ml-10">
                          <FormControl variant="outlined">
                            <Select
                              labelId="tabType"
                              id="demo-simple-select-outlined"
                              value={this.state.contentViewType}
                              onChange={(ev) => changeViewType(ev.target.value)}
                              name="tabType"
                              className='content-header-dropdown'
                            >
                              {this.state.tabs && this.state.tabs.length > 0 && this.state.tabs.map((data, index) => (
                                <MenuItem value={data.value} key={index}>{data.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </>
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
                            name="searchString"
                            onChange={(ev) => this.setState({ searchString: ev.target.value })}
                            value={this.state.searchString}
                            variant="outlined"
                            startAdornment={<InputAdornment position="start"><i className="fa fa-search" aria-hidden="true" ></i></InputAdornment>}
                            placeholder={getResourceValue(this.state.resources, "SEARCH")}
                            className="content-search-feild"
                          />
                        </FormControl>
                      </form>
                    </div>
                    {
                      (this.props.showBasketView && this.props.contentBaskets.length > 0) && <>
                        <button onClick={() => { this.setState({ sendNowModal: true }) }} className="btn btn-own btn-own-primary form-header-button ml-10 mw-100">{getResourceValue(this.state.resources, "SEND_NOW")}</button>
                      </>
                    }
                  </div>
                </div>
                <div className="row col-12 p-0 m-0">
                  {this.renderContents()}
                </div>
              </div>
            </div>
          </div>
          {this.state.deckModal &&
            <DeckModal
              open={this.state.deckModal}
              data={this.state.selectedContent}
              menu={DashboardStatus.SENDCONTENT}
              resources={this.state.resources}
              changeBasket={this.changeBasket}
              isAddedInBasket={this.isAddedInBasket}
              removeBasketContent={this.removeBasketContent}
              fetchContent={() => this.fetchContent()}
              setFavouriteToggle={() => { }}
              onCloseModal={() => this.setState({ deckModal: false })}
            />
          }
          {this.state.sendNowModal &&
            <SendMediaModal
              resources={this.state.resources}
              onCloseModal={() => this.setState({ sendNowModal: false })}
              data={this.props.contentBaskets}
              open={this.state.sendNowModal}
            />}
          {this.state.confirmModalOpen &&
            <ConfirmationModal
              resources={this.state.resources}
              open={this.state.confirmModalOpen}
              description={getResourceValue(this.state.resources, "REMOVE_BASKET_CONFIRMATION")}
              onCloseModal={this.onConfirmCloseModalFunc} />}
        </div>
      </>
    )
  }


}

const mapStateToProps = (state) => ({
  categoryId: state.common.categoryId,
  parentCategoryId: state.common.parentCategoryId,
  userCategories: state.common.userCategories,
  contentBaskets: state.common.contentBaskets,
  userDetail: state.user.userDetail,
  showBasketView: state.common.showBasketView,
  orgId: state.user.orgId,
  languageId: state.common.languageId,
  languageList: state.common.languageList,
  categoryType: state.common.categoryType,
  contentFilterType: state.common.contentFilterType,
  contentViewType: state.common.contentViewType,
  showCategories: state.common.showCategories,
  reRender: state.common.reRender,
});

export default connect(mapStateToProps)(withRouter(SendContent));
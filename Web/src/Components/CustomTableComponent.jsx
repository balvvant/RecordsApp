import {
  FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select
} from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "react-responsive-modal/styles.css";
import { withRouter } from "react-router-dom";
import { BUTTON_TYPES, PAGE_ENTRY_SIZE, RESOURCE_KEYS } from "../Constants/types";
import { LeftArrow, RightArrow } from "../Constants/svgIcons";
import { getResourceValue } from '../Functions/CommonFunctions';

const CustomTableComponent = React.memo((props) => {
  const [goToPage, setGoToPage] = useState([]);
  const [lastPage, setLastPage] = useState(0);
  const [isPrevEnable, setIsPrevEnable] = useState(false);
  const [isNextEnable, setIsNextEnable] = useState(false);

  useEffect(() => {
    let lastPage = Math.ceil(props.totalCount / props.pageSize);
    let isPrevEnable = !(props.currentPage < 2);
    let isNextEnable = (props.currentPage < lastPage);
    let totalDropdownItem = [];
    for (let index = 1; index <= lastPage; index++) {
      totalDropdownItem.push(index)
    }
    setGoToPage(totalDropdownItem);
    setLastPage(lastPage);
    setIsPrevEnable(isPrevEnable);
    setIsNextEnable(isNextEnable);
  }, [props]);
  return (
    <div className="table-container">
      {props.showNavigation != false && <div className="form-own cusTableForm" noValidate autoComplete="off"  >
        <div className="d-flex justify-content-between">
          {props.showTitle != false && <div className="justify-content-start customTblLbl"><h2 className="mb-0 table-header-text">{props.tableTitle} ({props.totalCount > 0 ? props.totalCount : 0})</h2></div>}
          <div className="d-flex flex-row">
            {props.showFilter &&
              <>
                {props.tabArray && props.tabArray.length > 1 &&
                  <div className="">
                    <FormControl variant="outlined">
                      <InputLabel id="tabType">{getResourceValue(props.resources, props.showSpecficSearch ? RESOURCE_KEYS.COMMON.SEARCH_BY : "TYPE")}</InputLabel>
                      <Select
                        labelId="tabType"
                        id="demo-simple-select-outlined"
                        value={props.currentTabActive}
                        onChange={props.setcurrentTabActive}
                        label={getResourceValue(props.resources, props.showSpecficSearch ? RESOURCE_KEYS.COMMON.SEARCH_BY : "TYPE")}
                        name="tabType"
                        style={props.showSpecficSearch ? { width: '120px'} : {}}
                      >
                        {props.tabArray && props.tabArray.length > 0 && props.tabArray.map((data, index) => (

                          <MenuItem value={data.val} key={index}>{data.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                }
                {props.totalCount > 25 &&
                  <div className="ml-10">
                    <FormControl variant="outlined">
                      <InputLabel id="show_per_page">{getResourceValue(props.resources, "SHOW_PER_PAGE")}</InputLabel>
                      <Select
                        labelId="show_per_page"
                        id="demo-simple-select-outlined"
                        value={props.pageSize}
                        onChange={(ev) => props.changePageSize(ev)}
                        label={getResourceValue(props.resources, "SHOW_PER_PAGE")}
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
              </>
            }
            {props.showSearchBar && <div className="ml-10">
              <form
                className="form-own form-auto-height"
                noValidate
                autoComplete="off"
                onSubmit={(ev) => props.searchFilter(ev)}
              >
                <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                  <OutlinedInput
                    id="standard-adornment-amount"
                    name="searchVal"
                    onChange={(ev) => props.changeValue(ev)}
                    value={props.searchVal}
                    variant="outlined"
                    startAdornment={<InputAdornment position="start"><i className="fa fa-search" aria-hidden="true" ></i></InputAdornment>}
                    placeholder={getResourceValue(props.resources, "SEARCH")}
                    style={{ background: '#F4F4F4', width: '200px' }}
                  />
                </FormControl>
              </form>
            </div>}

            {
              props.buttons && props.buttons.length > 0 && props.buttons.map((button) => {
                if (button.type != BUTTON_TYPES.PRIMARY && props.totalCount == 0) {
                  return null;
                }
                return <div className="ml-10">
                  <div >
                    <button type="button" onClick={() => button.onClick()} className={`btn ${button.type == BUTTON_TYPES.PRIMARY ? 'btn-own-primary' : 'gray-btn'}  min-height-btn mw-100`} style={{ fontSize: 14, }}>{button.text}</button>
                  </div>
                </div>
              })
            }
          </div>
        </div>
      </div>}

      {props.dataArray.length < 1 ?
        <div className="no-table-data cpb-14 cpt-14">{getResourceValue(props.resources, 'NO_RECORDS')}</div> :
        <div className="cusTomOwnTable" style={props.showNavigation != false ? {} : { borderRadius: '8px' }}>
          <table className="table cusTable mb-0">
            <thead>
              <tr className="tableHead">
                {(props.isCheckRequired) && (
                  <>
                    <th className="header-checkbox headCheck cursor"> <Checkbox
                      value="All"
                      checked={props.allChecked}
                      name="userId"
                      onChange={(ev) => props.checkedUsers(ev, null, "All")}
                    />
                    </th>
                  </>
                )}
                {props.columnArray &&
                  props.columnArray.length > 0 &&
                  props.columnArray.map((data, index) => {
                    return (
                      <th key={index}
                        className={data.isSort ? `sort-header  cursor ${props.sortObj.sortVal === data.databaseColumn ? "active" : ""} ${props.sortObj.sortType ? "aesc" : "desc"} ` : ''} style={data?.width ? { whiteSpace: 'pre-wrap', width: data.width } : {}}
                        onClick={() => data.isSort ? props.sortingTable(data.databaseColumn) : ''}
                      ><span className="header-txt" >{data.columnName}</span>
                        {data.isSort && <img
                          src="/assets/img/arrow-side.svg"
                          className="sort-icon"
                          alt="icon"
                        />}
                      </th>
                    )
                  })}
                {props.customButtonColumn &&
                  <th className="header-checkbox headCheck cursor">
                    <span className="header-txt">{props.customButtonColumn}</span>
                  </th>}
                {
                  props.customColumn && <th className="header-checkbox headCheck cursor">
                    <span className="header-txt">{props.customColumn}</span>
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              {props.dataArray &&
                props.dataArray.length > 0 &&
                props.dataArray.map((data, index) => {
                  let fileName;
                  if (data.brand_logo) {
                    let fileIndex = data.brand_logo.split("/");
                    fileName = fileIndex[fileIndex.length - 1];
                    fileName = fileName.split("_$_").pop();
                  }
                  return (

                    <tr key={index} onDoubleClick={() => {
                      if (!props.archive && props.openEditUserModalFunc) {
                        props.openEditUserModalFunc(data[props.primaryKey])
                      }
                    }} className="cursor">
                      {(props.isCheckRequired) &&
                        <>
                          {
                            data.email ?
                              <td> <Checkbox
                                value={data?.user_id}
                                checked={data.checked ? data.checked : false}
                                name="userId"
                                onChange={(ev) =>
                                  props.checkedUsers(ev, data?.user_id, "single")
                                }
                              /></td> : <td></td>
                          }

                        </>
                      }

                      {
                        props.columnArray.map((col, index) => {
                          if (data[col.databaseColumn]) {
                            let colValue = data[col.databaseColumn];
                            return (
                              <td className="cusTDWidth" key={index} style={col?.width ? { whiteSpace: 'pre-wrap', width: col.width } : {}} >{colValue}</td>
                            )
                          }
                          else {
                            return (
                              <td key={index}> {getResourceValue(props.resources, 'NA')}</td>
                            )
                          }

                        })
                      }
                      {
                        props.customButton && <td>
                          <a
                            className={'activateLink cursor'}
                            onClick={() => props.actionButton(data[props.primaryKey])}
                          >{props.customButton}</a>
                        </td>
                      }
                      {
                        props.customColumn && <td>
                          {props.customRow(data)}
                        </td>
                      }
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      }
      {props.pageSize < props.totalCount &&
        <div className="col-md-12 cusPaginationFooter" >
          <div className="cusPagination">
            {isPrevEnable ? <a href="#" onClick={() => props.goToPage(null, 'prev')} ><LeftArrow /></a> : <p className='m-0 disabled'><LeftArrow /></p>}
            <p className="pageNum mb-0">{getResourceValue(props.resources, 'PAGE')}  <span>{(props.currentPage)}</span> {getResourceValue(props.resources, 'OF').toUpperCase()} <span>{lastPage}</span></p>
            {isNextEnable ? <a href="#" onClick={() => props.goToPage(null, 'next')} ><RightArrow /></a> : <p className='m-0 disabled'><RightArrow /></p>}
            <div>
              <div className="d-md-inline-flex" style={{ alignItems: 'center' }}>
                <div className="pageNum d-none d-md-inline-flex"> {getResourceValue(props.resources, "JUMP_TO_PAGE")} </div>
                <FormControl variant="outlined">
                  <Select
                    labelId="JUMP_TO_PAGE"
                    id="demo-simple-select-outlined"
                    value={props.currentPage}
                    onChange={(ev) => props.goToPage(ev, 'jump')}
                    name="jumpToPage"
                  >
                    {goToPage && goToPage.length > 0 && goToPage.map((data, index) => (
                      <MenuItem value={data} key={index}>{data}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
        </div>
      }
    </div >
  );
})

export default withRouter(CustomTableComponent);

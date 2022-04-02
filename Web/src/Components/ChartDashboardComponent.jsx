import React from 'react';
import Chart from 'react-google-charts';
import { getResourceValue } from "../Functions/CommonFunctions";

const ChartDashboardComponent=({chartData})=>{
    return(
    <div className="row m-0">
    <div className="col-md-6 col-12 m-0 p-0">
    <div className="pie-chart-data cmr-10">
        <h4 className="text-center pt-3 pb-2">
        {getResourceValue(chartData.adminResources, "USER")}
        </h4>
        <Chart
        width={"100%"}
        height={"300px"}
        chartType="PieChart"
        loader={
            <div>
            {getResourceValue(
                chartData.adminResources,
                "PLEASE_WAIT"
            )}
            </div>
        }
        data={[
            [
            getResourceValue(chartData.adminResources, "USER"),
            getResourceValue(chartData.adminResources, "TOTAL"),
            ],
            [
            getResourceValue(chartData.adminResources, "ADMIN"),
            chartData.admin,
            ],
            [
            getResourceValue(chartData.adminResources, "DOCTOR"),
            chartData.doctor,
            ],
            [
            getResourceValue(chartData.adminResources, "PATIENT"),
            chartData.patient,
            ],
        ]}
        options={{
            title: "",
            // Just add this option
            is3D: true,
            slices: {
            0: { color: "#564aa3" },
            1: { color: "#2b957a" },
            2: { color: "#2f80e7" },
            },
        }}
        rootProps={{ "data-testid": "2" }}
        />
    </div>
    </div>
    <div className="col-md-6 col-12 m-0 p-0">
    <div className="pie-chart-data cmr-10">
        <h4 className="text-center pt-3 pb-2">
        {getResourceValue(chartData.adminResources, "STATUS")}
        </h4>
        <Chart
        width={"100%"}
        height={"300px"}
        chartType="PieChart"
        loader={
            <div>
            {getResourceValue(
                chartData.adminResources,
                "PLEASE_WAIT"
            )}
            </div>
        }
        data={[
            [
            getResourceValue(chartData.adminResources, "USER"),
            getResourceValue(chartData.adminResources, "TOTAL"),
            ],
            [
            getResourceValue(chartData.adminResources, "ACTIVE"),
            chartData.users,
            ],
            [
            getResourceValue(chartData.adminResources, "INACTIVE"),
            chartData.inactiveUsers,
            ],
        ]}
        options={{
            title: "",
            // Just add this option
            is3D: true,
            slices: {
            0: { color: "#00897b" },
            1: { color: "#c2185b" },
            },
        }}
        rootProps={{ "data-testid": "2" }}
        />
    </div>
    </div>
    </div>
)
}
    export default ChartDashboardComponent;
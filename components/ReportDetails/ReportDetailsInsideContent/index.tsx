import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import Image from 'next/image';
import Head from 'next/head';

// Importing Icons
import { CiTimer } from "react-icons/ci";
import { AiOutlineMail, AiOutlinePlus } from "react-icons/ai";
import { BsCheckCircle, BsTriangle } from "react-icons/bs";
import { TbListDetails, TbSquareRotated } from "react-icons/tb";
import { SlLink } from "react-icons/sl";

// import DatePicker from 'react-date-picker/dist/entry.nostyle';

import dayjs, { Dayjs } from "dayjs";
import { differenceInDays } from "date-fns";

// Firebase Imports
import {
    doc,
    collection,
    onSnapshot,
    addDoc,
    query,
    orderBy,
    deleteDoc,
    setDoc,
    where,
    getFirestore,
    updateDoc,
} from "firebase/firestore";

import { useCollection } from "react-firebase-hooks/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { db, auth } from "../../../firebase";
import CustomLoader from '@app/components/CustomLoader';
import HeaderReportDetails from '@app/components/HeaderReportDetails';

// Importing Material ui
import {
    Button,
    Grid
} from '@mui/material';

import StatReportIndividual from '@app/components/ReportDetails/StatReportIndividual';
import GraphReportIndividual from '@app/components/ReportDetails/GraphReportIndividual';

// Importing Styles
import styles from './style.module.css';
import colors from '@app/lib/colors';

interface ReportDetailsInsideContentProps {
    reportID: any;
    reportName: any;
    isSignedIn: boolean;
    signedInUserData: any;

    // Add Task Model Open
    isAddTaskModalOpen: boolean;
    setIsAddTaskModalOpen: (value: boolean) => void;
    projectMembers: any;

    // Invited Members Modal
    isInvitedMembersModalOpen: boolean;
    setIsInvitedMembersModalOpen: (value: boolean) => void;

    isOpen: boolean;

    showHeader: boolean;
}

const ReportDetailsInsideContent: NextPage<ReportDetailsInsideContentProps> = ({
    reportID,
    reportName,
    isSignedIn,
    signedInUserData,
    isAddTaskModalOpen,
    setIsAddTaskModalOpen,
    projectMembers,
    isInvitedMembersModalOpen,
    setIsInvitedMembersModalOpen,
    isOpen,
    showHeader
}) => {

    // Stat Report Data
    const statReportData: any = [
        {
            reportTitle: "Total Tasks",
            reportValue: "15",
            reportIcon: <TbListDetails size={30} />,
            reportColor: "#FFC107",
        },
        {
            reportTitle: "Completed Tasks",
            reportValue: "5",
            reportIcon: <BsCheckCircle size={30} />,
            reportColor: "#4CAF50",
        },
        {
            reportTitle: "Incomplete Tasks",
            reportValue: "5",
            reportIcon: <TbSquareRotated size={30} />,
            reportColor: "#F44336"
        },
        {
            reportTitle: "Overdue Tasks",
            reportValue: "5",
            reportIcon: <BsTriangle size={30} />,
            reportColor: "#FF9800"
        }
    ];

    // Graph Report Data
    const graphReportData: any = [
        {
            "reportTitle": "Incomplete tasks by project",
            "reportData": {
                labels: ["What a Name", "FYP"],
                datasets: [
                    {
                        data: [5, 4],
                        backgroundColor: colors,
                        label: "Incomplete Tasks by Project",
                        borderColor: colors,
                        fill: false
                    }
                ],
            },
            "graphType": "line",
            "reportColor": "#FFC107",
            "reportDescription": "This graph shows the number of incomplete tasks in each project."
        },
        {
            "reportTitle": "Incomplete tasks by priority",
            "reportData": {
                labels: ["High", "Medium", "Low"],
                datasets: [
                    {
                        data: [2, 3, 0],
                        backgroundColor: ["#FF0000", "#FFA500", "#FFFF00"],
                        label: "Incomplete Tasks",
                        borderColor: ["#FF0000", "#FFA500", "#FFFF00"],
                        fill: false
                    }
                ],
            },
            "graphType": "bar",
            "reportColor": "#4CAF50",
            "reportDescription": "This graph shows the number of incomplete tasks in each priority."
        },
        {
            "reportTitle": "Incomplete tasks by assignee",
            "reportData": {
                labels: [
                    "bilalmohib7896@gmail.com",
                    "bilalmohib2001@gmail.com",
                    "bilalfullstackdevelper@gmail.com",
                    "mbilals9922@gmail.com",
                ],
                datasets: [
                    {
                        data: [4, 5, 1, 2],
                        backgroundColor: colors,
                        label: "Incomplete Tasks",
                        borderColor: colors,
                        fill: false
                    }
                ],
            },
            "graphType": "radar",
            "reportColor": "#F44336",
            "reportDescription": "This graph shows the number of incomplete tasks in each assignee."
        },
        {
            "reportTitle": "Incomplete tasks by due date",
            "reportData": {
                labels: ["Today", "Tomorrow", "NextWeek"],
                datasets: [
                    {
                        data: [4, 0, 2],
                        backgroundColor: ["rgb(75, 192, 192)", "rgb(255, 99, 132)", "rgb(255,165,0)"],
                        label: "Incomplete Tasks",
                        borderColor: ["rgb(75, 192, 192)", "rgb(255, 99, 132)", "rgb(255,165,0)"],
                        fill: false
                    }
                ],
            },
            "graphType": "doughnut",
            "reportColor": "#FF9800",
            "reportDescription": "This graph shows the number of incomplete tasks in each due date."
        }
    ];

    // States for Report Data
    const [statReportDataState, setStatReportDataState] = useState<any>(statReportData);
    const [graphReportDataState, setGraphReportDataState] = useState<any>(graphReportData);

    const e = signedInUserData.email;
    /////////////////////////////////////// Database Part ////////////////////////////////////////////////
    // let q = query(collection(db, "Data", "Projects", e));
    let q = query(collection(db, "Projects"));

    const [snapshot, loading, error] = useCollection(q, {
        snapshotListenOptions: { includeMetadataChanges: true },
    });

    // const [loading, setLoading] = useState(true);

    const [projects, setProjects] = useState<any>([]);

    useEffect(() => {
        if (!loading && snapshot && e) {

            let localObj: any;

            let arrProjectsLocal = snapshot?.docs.map(doc => ({ ...doc.data(), id: doc.id }));

            localObj = arrProjectsLocal;

            // Now only i need projects that are created by me means email is equal to signedInUserData.email
            // or that are shared with me means project members array contains signedInUserData.email

            // Filter the projects array and extract only those projects that are created by me
            // localObj = localObj.filter((project: any) => );

            // Filter the projects array and extract only those projects that are shared with me
            localObj = localObj.filter((project: any) => project?.ProjectMembers?.includes(signedInUserData.email) || project?.createdBy === signedInUserData.email);

            let arrProjects: any = localObj;

            let totalTasks = 0;
            let completedTasks = 0;
            let incompleteTasks = 0;
            let overdueTasks = 0;

            let localStatReportData: any = [...statReportDataState];
            let localGraphReportData: any = [...graphReportDataState];

            let incompleteByProject: any = {};
            let incompleteByPriority: any = { High: 0, Medium: 0, Low: 0 };
            let incompleteByAssignee: any = {};
            let incompleteByDueDate: any = { Today: 0, Tomorrow: 0, NextWeek: 0 };

            arrProjects.forEach((project: { ProjectTasks: any[]; ProjectName: string | number; }) => {
                project.ProjectTasks.forEach((task) => {
                    totalTasks++;

                    if (task.taskStatus === "completed") {
                        completedTasks++;
                    } else if (task.taskStatus === "inProgress" || task.taskStatus === "Open") {
                        incompleteTasks++;

                        // Update incomplete tasks by project
                        if (!incompleteByProject[project.ProjectName]) {
                            incompleteByProject[project.ProjectName] = 0;
                        }
                        incompleteByProject[project.ProjectName]++;

                        // Update incomplete tasks by priority
                        if (task.taskPriority) {
                            incompleteByPriority[task.taskPriority]++;
                        }

                        // Update incomplete tasks by assignee
                        task.taskAssignee.forEach((assignee: any) => {
                            if (!incompleteByAssignee[assignee]) {
                                incompleteByAssignee[assignee] = 0;
                            }
                            incompleteByAssignee[assignee]++;
                        });

                        // Update incomplete tasks by due date
                        const daysToDueDate = differenceInDays(new Date(task.taskDue), new Date());
                        if (daysToDueDate === 0) {
                            incompleteByDueDate.Today++;
                        } else if (daysToDueDate === 1) {
                            incompleteByDueDate.Tomorrow++;
                        } else if (daysToDueDate <= 7) {
                            incompleteByDueDate.NextWeek++;
                        }
                    } else if (task.taskStatus === "overdue") {
                        overdueTasks++;
                    }
                });
            });

            console.log("Total Tasks ==> ", totalTasks);
            console.log("Completed Tasks ==> ", completedTasks);
            console.log("Incomplete Tasks ==> ", incompleteTasks);
            console.log("Overdue Tasks ==> ", overdueTasks);

            // Update statReportData
            localStatReportData[0].reportValue = totalTasks.toString();
            localStatReportData[1].reportValue = completedTasks.toString();
            localStatReportData[2].reportValue = incompleteTasks.toString();
            localStatReportData[3].reportValue = overdueTasks.toString();

            // Update graphReportData
            localGraphReportData[0].reportData = {
                labels: Object.keys(incompleteByProject),
                datasets: [
                    {
                        data: Object.values(incompleteByProject),
                        backgroundColor: colors,
                        label: "Incomplete Tasks",
                        borderColor: colors,
                        fill: false
                    },
                ],
            };
            localGraphReportData[1].reportData = {
                labels: Object.keys(incompleteByPriority),
                datasets: [
                    {
                        data: Object.values(incompleteByPriority),
                        backgroundColor: ["#FF0000", "#FFA500", "#FFFF00"],
                        label: "Incomplete Tasks",
                        borderColor: ["#FF0000", "#FFA500", "#FFFF00"],
                        fill: false
                    },
                ],
            };
            localGraphReportData[2].reportData = {
                labels: Object.keys(incompleteByAssignee),
                datasets: [
                    {
                        data: Object.values(incompleteByAssignee),
                        backgroundColor: colors,
                        label: "Incomplete Tasks by Assignee",
                        borderColor: colors,
                        fill: false
                    },
                ],
            };
            localGraphReportData[3].reportData = {
                labels: Object.keys(incompleteByDueDate),
                datasets: [
                    {
                        data: Object.values(incompleteByDueDate),
                        backgroundColor: ["rgb(75, 192, 192)", "rgb(255, 99, 132)", "rgb(255,165,0)"],
                        label: "Incomplete Tasks by Due Date",
                        borderColor: ["rgb(75, 192, 192)", "rgb(255, 99, 132)", "rgb(255,165,0)"],
                        fill: false
                    },
                ],
            };

            console.log("localStatReportData ==> ", localStatReportData);
            console.log("localGraphReportData ==> ", localGraphReportData);

            // Update statReportData
            setStatReportDataState(localStatReportData);

            // Update graphReportData
            setGraphReportDataState(localGraphReportData);

            setProjects(arrProjects);
            console.log("Projects ==> ", projects);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, snapshot, signedInUserData]);
    // FOR GETTING PROJECTS

    // // Update Report Data
    // useEffect(() => {
    //     updateReportData();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [projects]);

    // const updateReportData = () => {

    // };

    return (
        <div className={styles.container}>
            {(isSignedIn) ? (
                <div className={styles.container}>
                    {(showHeader) && (
                        <header className={`fixed-top ${styles.header} ${(isOpen) && (styles.shrinkContainer)}`}>
                            <HeaderReportDetails
                                reportID={reportID}
                                email={signedInUserData.email}
                                reportName={reportName}
                                photoURL={signedInUserData.photoURL}
                                isOpen={isOpen}
                            />
                            <div className='pl-5 border-t-[1px] border-[#edebea] border-b-[1px] border-solid w-[100%]'>
                                {/* <Button
                                    variant="contained"
                                    className="mt-3 mb-3"
                                    style={{
                                        backgroundColor: "#4573d2",
                                        color: "#ffffff",
                                        fontWeight: 400,
                                        fontSize: 14,
                                        textTransform: "none",
                                        borderRadius: 5,
                                        padding: "10px 20px",
                                        boxShadow: "none",
                                        height: "35px",
                                    }}
                                >
                                    <AiOutlinePlus className="mr-2" />
                                    Add Chart
                                </Button> */}
                            </div>
                        </header>
                    )}

                    <div style={{ width: "95%", marginLeft: "2.5%", marginTop: "25px", transition: "0.2s linear" }}>
                        <Grid container spacing={3}>
                            {statReportDataState.map((report: any, index: number) => (
                                <Grid item xs={12} sm={6} md={3} key={index}>
                                    <StatReportIndividual
                                        reportTitle={report.reportTitle}
                                        reportValue={report.reportValue}
                                        reportIcon={report.reportIcon}
                                        reportColor={report.reportColor}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        <Grid container spacing={3} style={{ marginTop: -50, marginBottom: "30px" }}>
                            {graphReportDataState.map((report: any, index: number) => (
                                <Grid item xs={12} sm={6} md={6} key={index}>
                                    <GraphReportIndividual
                                        reportTitle={report.reportTitle}
                                        reportData={report.reportData}
                                        graphType={report.graphType}
                                        reportColor={report.reportColor}
                                        reportDescription={report.reportDescription}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                </div>
            ) : (
                <CustomLoader />
            )}
        </div>
    )
}
export default ReportDetailsInsideContent;
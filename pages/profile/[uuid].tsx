import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import Image from 'next/image';
import Head from 'next/head';
import styles from './style.module.css';

// Importing Icons
import { CiTimer } from "react-icons/ci";
import { AiOutlineMail } from "react-icons/ai";
import { BsCheckCircle } from "react-icons/bs";

import DatePicker from 'react-date-picker/dist/entry.nostyle';

import {
    doc,
    collection,
    onSnapshot,
    addDoc,
    query,
    orderBy,
    deleteDoc,
    setDoc,
    where
} from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';

import {
    onAuthStateChanged,
} from "firebase/auth";

import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from "../../firebase";
import CustomLoader from '../../components/CustomLoader';

const currentDate = new Date();

const Profile: NextPage = () => {
    return (
        <div>
            <Head>
                <title>Profile - Project Management Software</title>
                <meta name="description" content="Project Management Software" />
                <link rel="icon" href="/logocopy.ico" />
            </Head>
        </div>
    )
}

const ProfileComp = () => {

    const [taskDue, setTaskDue] = useState<any>(currentDate);

    const frequentCollaboratorsList = [
        {
            name: "Bilal Mohib",
            email: "bilalmohib7896@gmail.com",
            photoURL: null
        },
        {
            name: "Arif Alvi",
            email: "arifalvi@gmail.com",
            photoURL: null
        },
        {
            name: "Imran Khan",
            email: "imrankhan@gmail.com",
            photoURL: null
        },
        {
            name: "Nawaz Sharif",
            email: "nawazsharif@gmail.com",
            photoURL: null
        },
        {
            name: "Asif Ali Zardari",
            email: "asifalizardari@gmail.com",
            photoURL: null
        }
    ]

    const router = useRouter();

    const { uuid } = router.query;

    const [firestoreData, setFirestoreData] = useState<any>([]);
    const [status, setStatus] = useState<Boolean>(false);
    const [signedInUserData, setSignedInUserData] = useState<any>(null);
    const [isSignedIn, setIsSignedIn] = useState<Boolean>(false);

    useEffect(() => {

        // console.log("Current Path : ", window.location.pathname);
        // console.log("activeJobs ==>", activeJobs);

        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                if (signedInUserData === null) {
                    if (user.isAnonymous === true) {
                        let tempUser = {
                            displayName: "Anonymous Guest",
                            email: "anonymous@guest.com",
                            photoURL: user.photoURL,
                        }
                        console.log(tempUser);
                        setSignedInUserData(tempUser);
                        setIsSignedIn(true);
                    } else {
                        console.log(user);
                        setSignedInUserData(user);
                        setIsSignedIn(true);
                    }
                    // ...
                }
            } else {
                // User is signed out
                console.log("User is signed out");
                // alert("Please sign in to continue");
                // navigate("/login");
                // ...
            }
        });
    }, [signedInUserData, isSignedIn]);

    /////////////////////////////////////// Database Part ////////////////////////////////////////////////
    let q = query(collection(db, "Data", "Projects", `${uuid}`));

    const [snapshot, loading, error] = useCollection(
        q,
        {
            snapshotListenOptions: { includeMetadataChanges: true },
        }
    );

    // GETTINGS Active Jobs
    const [projects, setProjects] = useState<any>([])
    // const [loading, setLoading] = useState(true); 

    // FOR GETTING PROJECTS
    useEffect(() => {

        if (!loading) {
            // if (snapshot.docs.length !== projects.length) {
            setProjects(snapshot?.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            // setLoading(false);
            // console.clear();
            console.log("Projects ==> ", projects);
            // }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, snapshot]);
    // FOR GETTING PROJECTS

    // useEffect(() => {
    //     if (projects.length !== 0) {
    //         setTaskDue(projects.map((project: any) => project.taskDue));

    /////////////////////////////////////// Database Part ////////////////////////////////////////////////

    return (
        <div className={styles.container}>
            {(isSignedIn && !loading) ? (
                <div>
                    <div className={styles.profileContainerTop}>
                        <div className='d-flex'>
                            <div className={styles.profileImageContainer}>
                                <Image
                                    className={styles.profileImage}
                                    width={160}
                                    height={160}
                                    src={signedInUserData.photoURL}
                                    alt={signedInUserData.displayName}
                                    title={signedInUserData.displayName}
                                />
                            </div>
                            <div className={styles.profileRightContainer}>
                                <h4 className={styles.profileName}>{signedInUserData.displayName}</h4>
                                <p className={styles.profileInfoContainer}>
                                    <p><CiTimer /> 10:19am local time</p>
                                    <p style={{ marginLeft: 10 }}><AiOutlineMail /> <span className={styles.email}>bilalmohib20001@gmail.com</span></p>
                                </p>
                            </div>
                        </div>
                        <div>
                            <button className={`btn btn-primary ${styles.signOutBtn}`} onClick={() => {
                                auth.signOut();
                                router.push("/login");
                            }}>Sign Out</button>
                        </div>
                    </div>

                    {/* MAIN Profile Container */}
                    <div className={styles.profileContainerMain}>
                        <div className={styles.myTasksMainContainer}>
                            <div>
                                <header className={styles.headerMyTasks}>
                                    <div>
                                        My tasks
                                    </div>
                                    <div className={styles.myTasksHeaderRight}>
                                        <button className={`btn ${styles.viewAllTasksBtn}`} onClick={() => {
                                            alert("View all tasks");
                                        }}>View all tasks</button>
                                    </div>
                                </header>
                                <section className={styles.bodymyTasksContainer}>
                                    {
                                        projects.map((item: any, index: any) => {
                                            return (
                                                <div key={index} className={styles.myTasksList}>
                                                    <div className={styles.myTasksListLeft}>
                                                        <p className={styles.taskCompleteIcon} onClick={() => alert("Mark As Completed")}><BsCheckCircle /></p>
                                                        <p className={styles.pnmyTask}>{item.ProjectName}</p>
                                                    </div>
                                                    <div className={styles.myTasksListRight}>
                                                        <DatePicker
                                                            onChange={setTaskDue}
                                                            value={new Date(item.ProjectEndingDate)}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </section>
                            </div>
                        </div>

                        <div className={styles.rightSideMainContainer}>
                            <div className={styles.aboutMeContainer}>
                                <h1>About me</h1>
                                <p>Use this space to tell people about yourself.</p>
                            </div>
                            <div className={styles.frequentCollaborators}>
                                <h1 className={styles.fcHeading}>Frequent collaborators</h1>
                                <div className={styles.outsideContainerFCL}>
                                    {
                                        frequentCollaboratorsList.map((item, index) => {
                                            return (
                                                <div key={index} className={styles.frequentCollaboratorsList}>
                                                    <div className={`${styles.lifcl} d-flex`}>
                                                        <div className={styles.frequentCollaboratorsImageContainer}>
                                                            <Image
                                                                className={styles.frequentCollaboratorsImage}
                                                                width={48}
                                                                height={48}
                                                                src={(item.photoURL !== null)
                                                                    ? item.photoURL
                                                                    : "http://localhost:3000/_next/image?url=https%3A%2F%2Flh3.googleusercontent.com%2Fa%2FAEdFTp7zFuG2WiiEzzreDfzI4170bnvEDdD_l1Hlly7K%3Ds96-c&w=256&q=75"
                                                                }
                                                                alt={item.name}
                                                                title={item.name}
                                                            />
                                                        </div>
                                                        <div className={styles.frequentCollaboratorsNameContainer}>
                                                            <p className={styles.emailfcnc}>{item.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                {/* <br /> */}
                            </div>
                        </div>
                    </div>


                    {/* MAIN Profile Container */}
                    <div className={styles.profileContainerMain}>
                        <div className={styles.myTasksMainContainer}>
                            <div>
                                <header className={styles.headerMyTasks}>
                                    <div>
                                        My recent projects
                                    </div>
                                </header>
                                <section className={styles.bodymyTasksContainer}>
                                    {
                                        projects.map((item: any, index: any) => {
                                            return (
                                                <div key={index} className={styles.myTasksList}>
                                                    <div className={styles.myTasksListLeft}>
                                                        <p className={styles.taskCompleteIcon} onClick={() => alert("Mark As Completed")}><BsCheckCircle /></p>
                                                        <p className={styles.pnmyTask}>{item.ProjectName}</p>
                                                    </div>
                                                    <div className={styles.myTasksListRight}>
                                                        <DatePicker
                                                            onChange={setTaskDue}
                                                            value={new Date(item.ProjectEndingDate)}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </section>
                            </div>
                        </div>

                        <div className={styles.rightSideMainContainer}>
                            {/*  */}
                        </div>
                    </div>
                    <br /><br />
                    {/* MAIN Profile Container */}
                </div>
            ) : (
                <CustomLoader />
            )}
        </div>
    )
}

export {
    Profile as default,
    ProfileComp
}

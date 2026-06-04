import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import welcome from "./components/WelcomeScreen/Welcome";
import login from "./components/VerificationMethods/Login";
import signup from "./components/VerificationMethods/Register";
import verification from "./components/VerificationMethods/PhoneVerification";
import success from "./components/VerificationMethods/VerificationSuccess";
import home from "./components/Home/HomeScreen";
import tasks from "./components/Home/Task";
import availableTask from "./components/Home/AvailableTasks";
import chatList from "./components/Chat/ChatList";
import callScreen from "./components/Chat/CallScreen";
import chatScreen from "./components/Chat/ChatScreen";
import profilescreen from "./components/Profile&Settings/ProfileScreen";
import security from "./components/Profile&Settings/AccountSecurity";
import userInfo from "./components/Profile&Settings/UserInfo";
import changePassword from "./components/Profile&Settings/ChangePassword";
import help from "./components/Profile&Settings/Help&Support";
import intro from "./components/WelcomeScreen/Intro";
import tracking from "./components/WelcomeScreen/Track";
import stat from "./components/WelcomeScreen/Statistics";
import loadingScreen from "./components/WelcomeScreen/LoadingScreen";
import taskReport from "./components/OnTask/TaskReport";
import currentTask from "./components/OnTask/OnTask";
import notification from "./components/Profile&Settings/Notifications";
import getLocation from "./components/ToggeLocation/GetLocation";
import technicalAssist from "./components/AiTechnician/TechiAI";
import deleteAccountConfirmation from "./components/Profile&Settings/DeleteAccountConfirmation";

const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="intro"
                screenOptions={{
                    headerShown: false, // Show header
                }}
            >
                <Stack.Screen
                    name="welcome"
                    component={welcome}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="login"
                    component={login}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="signup"
                    component={signup}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="verification"
                    component={verification}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="home"
                    component={home}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="success"
                    component={success}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="tasks"
                    component={tasks}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="availableTask"
                    component={availableTask}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="chatList"
                    component={chatList}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="callScreen"
                    component={callScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="chatScreen"
                    component={chatScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="profilescreen"
                    component={profilescreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="security"
                    component={security}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="userInfo"
                    component={userInfo}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="changePassword"
                    component={changePassword}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="help"
                    component={help}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="intro"
                    component={intro}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="tracking"
                    component={tracking}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="stat"
                    component={stat}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="loadingScreen"
                    component={loadingScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="taskReport"
                    component={taskReport}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="currentTask"
                    component={currentTask}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="notification"
                    component={notification}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="getLocation"
                    component={getLocation}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="technicalAssist"
                    component={technicalAssist}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="deleteAccountConfirmation"
                    component={deleteAccountConfirmation}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;

const express = require('express');
const querystring = require('querystring');
const crypto = require('crypto');
const axios = require('axios');
const xml2js = require('xml2js');
require("dotenv").config()
const cors = require("cors")
const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors())
// Set up API credentials
const BBB_SERVER_URL = process.env.BBB_SERVER_URL;
const BBB_SECRET_KEY = process.env.BBB_SECRET_KEY;

// Define the meeting parameters
// const meetingName = "my-meeting";
const meetingID = "QuizizzMeet";
const atten = "ap";
const moder = "mp";
// Create the meeting using the API
const createMeeting = async () => {
  try {
    const params = {
      allowStartStopRecording: false,
      attendeePW: atten,
      autoStartRecording: false,
      meetingID: meetingID,
      moderatorPW: moder,
      name: meetingID,
      record: false,
    };

    const query = querystring.stringify(params);
    const url = `${BBB_SERVER_URL}/create?${query}&checksum=${bbbChecksum('create', params)}`;
    return url;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Calculate the checksum for the API call
const bbbChecksum = (action, params) => {
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
  const checksum = crypto.createHash('sha1').update(`${action}${sortedParams}${BBB_SECRET_KEY}`, 'utf8').digest('hex');
  return checksum;
};

// Generate a join URL for the meeting as a Admin
const getJoinUrlAdmin = (meetingId) => {
  const params = {
    fullName: "Test",
    meetingID: meetingId,
    password: moder,
    redirect: false,
  };
  const query = querystring.stringify(params);
  const url = `${BBB_SERVER_URL}/join?${query}&checksum=${bbbChecksum('join', params)}`;
  return url;
};

// Generate a join URL for the meeting as a User
const getJoinUrlUser = (meetingId) => {
  const params = {
    fullName: "Test",
    meetingID: meetingId,
    password: atten,
    redirect: false,
  };
  const query = querystring.stringify(params);
  const url = `${BBB_SERVER_URL}/join?${query}&checksum=${bbbChecksum('join', params)}`;
  return url;
};

// Launch the meeting and embed it in your website
const launchMeeting = async () => {
  const meetingURL = await createMeeting();
  // console.log(meetingURL);
  if (!meetingURL) {
    console.error('Failed to create BigBlueButton meeting');
    return;
  }
  const urlAdmin = getJoinUrlAdmin(meetingID)
  // const iframeHtmlAdmin = `<iframe src="${urlAdmin}" width="800" height="600" allowfullscreen></iframe>`;
  // console.log("Admin URL : ", urlAdmin);
  const urlUser = getJoinUrlUser(meetingID)
  // const iframeHtmlUser = `<iframe src="${urlUser}" width="800" height="600" allowfullscreen></iframe>`;
  // console.log("Attendee URL : ", urlUser);

  app.get("/", (req, res) => {
    res.send({
      createMeeting : meetingURL,
      adminURL : urlAdmin,
      userURL : urlUser,
    })
  })
}

// Call the launchMeeting function when a user enters the particular Quiz;

app.listen(PORT, () => {
  launchMeeting();
  console.log("Server Started");
})
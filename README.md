## CFDWP

This repository contains the frontend part of the CFDWP application. CFDWP is a web application for visualizing CFD results. The application lets the teacher upload simulation results which can then be opened and visualized to the student with just two clicks. In addition, the teacher can set multiple custom options, and add notes to the simulation results to help describe it to the student. With CFDWP, polygonal data (.vtp and .vtkjs formats) volumetric data (.vti format) can be visualized.

A demo of the application is available at https://cfdwp.onrender.com/. Please note that because the demo is deployed on fully free resources, the API goes to sleep after 15 minutes of inactivity. Therefore, the loading times can occasionally be high.

The application is built using the React framework and TypeScript. For reading and rendering the CFD results, an open-source scientific visualization library called VTK.js is used.

### Setup
Start by first running locally the API of the web application. See https://github.com/RSalminen/cfdwp-api for instructions.

Then, follow the following instructions:
1. Make sure you have Git installed https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
2. Make sure you have NPM installed https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
3. clone the source code to a folder by running the command ```git clone https://github.com/RSalminen/cfdwp-app.git```
4. run command ```npm install``` and then ```npm start```
5. open http://localhost:3000

### Additional information
This application was created as a part of the Master's Thesis by Robin Salminen. In case of any questions, contact robin765.salminen765@gmail.com

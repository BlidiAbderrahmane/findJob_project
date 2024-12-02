# Software Lab 2 FindJob Application

FindJob Application is a web application designed to help you find your dream job.  
Developed using **Express.js**, **EJS**, and a **MySQL database**, FindJob offers a complete solution for job hunting, combining ease of use and efficiency.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Project Structure](#project-structure)


## Installation

Follow these steps to install and configure the project:

1. **Clone the repository**
   ```bash
   git clone https://github.com/BlidiAbderrahmane/findJob_project.git
   ````


2. **Navigate to the project directory** 

    ```bash
    cd myapp
    ````

3. **Install dependencies**

    ```bash 
    npm install
    ````

## Usage

To run the application, use the following command

    ```bash
    npm start
    ````

Open your browser and go to http://localhost:3000 to view the application.

## Configuration

You can configure the application using environment variables.
Create a .env file in the root directory and add the following lines:

   ```` bash
    DB_HOST=XXXXXXXXXXXX
    DB_USER=XXXXXXXXXXXX
    DB_PASSWORD=XXXXXXXXXX
    DATABASE=XXXXXXXX
    PATH=XXXXXXXXXXXXXXXX
   ````

## Project Structure
Below is the organization of the project :

       Conception/
        ├── classdiagram.png
        ├── classdiagram.puml
        ├── Classes descrition.pdf
        ├── Databse description.pdf
        ├── dummy data.sql
        ├── Tables.sql
        ├── usecasediagram.png
        ├── usecasediagram.puml
        myapp/
        ├── bin/
        ├── model/
        ├── node_modules/
        ├── public/
        ├── routes/
        ├── test/
        ├── views/
        ├── .env
        ├── .gitignore
        ├── app.js
        ├── package-lock.json
        ├── package.json
        └── session.js


![logo](https://user-images.githubusercontent.com/67434664/94055454-f7177a00-fdaa-11ea-95dd-1d4980400812.png)

# Docketeer

Managing Docker images, containers and networks from the command line while also trying to monitor crucial metrics can be tedious and counterintuitive. To make this process more developer-friendly, we created Docketeer: a GUI for Docker.

Download our app: [https://www.docketeer.io/](https://www.docketeer.io/)


## Get Started

Getting started with Docketeer is easy: visit [docketeer.io](https://www.docketeer.io/) and download the Docketeer desktop app. Drag and drop the .dmg file that you downloaded into your Applications folder to install it. Before you run the application, make sure Docker itself is running.


## Service providing

### Running Containers

Once you open the app, you will be able to see any containers that are already running. You can stop or see more details about any container with the click of a button. You can also run a container based on the id or repo of an image from the top-right.

<img width="1297" alt="running" src="https://user-images.githubusercontent.com/67434664/94055509-08f91d00-fdab-11ea-9d2d-3938f9c3d988.png">



### Exited Containers

On the Exited Containers tab, you can view the containers that exited or were stopped. You can click to re-run or remove any exited container.

<img width="1297" alt="exited" src="https://user-images.githubusercontent.com/67434664/94055552-144c4880-fdab-11ea-992d-a7b5ebb0ad1e.png">



### Images

On the Images tab, you can view the images that are available for you locally. You can click to run or remove any image and you can also pull images from DockerHub by providing repo:version and clicking pull on the top-right.

<img width="1297" alt="images" src="https://user-images.githubusercontent.com/67434664/94055551-13b3b200-fdab-11ea-9efa-6b2152a59777.png">



### Metrics

On the Metrics tab, you can view the total amount of resources that your containers are currently using.

<img width="1297" alt="metrics" src="https://user-images.githubusercontent.com/67434664/94055553-144c4880-fdab-11ea-8bf3-ad0bed7f411e.png">



### Docker Compose

On the Docker Compose tab, you can drag and drop or upload a docker-compose.yml file to run multi-container applications and view your separate networks.

![compose](https://user-images.githubusercontent.com/67434664/94055554-14e4df00-fdab-11ea-9bd3-7832c22fd85f.png)

### Twilio setup
    1. Download the helper library from https://www.twilio.com/docs/node/install
    2. In order to manage Twilio SMS notifications follow the step plan : https://www.twilio.com/docs/notify/quickstart/sms#messagingservice
    3. Store your (i) Twilio number, (ii) Account Sid, (iii) Auth Token from twilio.com/console, (iv) SERVICE_SID, (v) verification service SID     in a newly created .env file in the Docketeer folder in the following format:
        MY_PHONE_NUMBER='+19252559538'
        TWILIO_ACCOUNT_SID='code from your console'
        TWILIO_AUTH_TOKEN='token from your console'
        SERVICE_SID='code from notify service instance'
        VERIFICATION_SERVICE_SID='code from verify service instance'
    4. verification service was created here: https://www.twilio.com/console/verify/services   code length and serviceSID can be taken from your Twilio account console
    5. All historical messages from the Twilio account can be found here: https://www.twilio.com/console/sms/logs


## Development

All ideas and contributions to the project are welcome. To run the app in development mode, clone our repo to your local machine and execute the following commands:

```
npm install
```

```
npm run dev         // ??? ONCE WE ADDED THE SERVER IT SHOULD BE LAUNCHED WITH NPM RUN START???
```



## Testing

To conduct tests on the codebase, clone our repo to your local machine and execute the following commands in the terminal: 

```
npm install
```

```
npm run test
```



## Built With

- React (Hooks, Router): Frontend library
- Redux: State management library
- Electron: Desktop app framework
- Webpack: Bundler
- npm: Package manager
- Chart.js: Data visualization
- Jest: Testing framework
- Enzyme: Testing utility
- ESLint: Linter


## Contributors

- Dan Lin [@GitHub](https://github.com/ilikecolddrinks) [@LinkedIn](https://www.linkedin.com/in/danlin91/)
- Kadir Gundogdu [@GitHub](https://github.com/kadirgund) [@LinkedIn](https://www.linkedin.com/in/kadirgund/)
- Minchan Jun [@GitHub](https://github.com/MinchanJun) [@LinkedIn](https://www.linkedin.com/in/minchan-jun/)
- Wilmer Sinchi [@GitHub](https://github.com/sinchiw) [@LinkedIn](https://www.linkedin.com/in/wilmer-sinchi-143b7681/)


## LICENSE

Distributed under the MIT License. See LICENSE for more information.

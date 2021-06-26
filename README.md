Setting up the Application:
- Install Node if not present in the system from [NodeJs.org](https://nodejs.org/en/)
- Check if node is installed properly:
	1. Open cmd
	2. Type node -v
	3. You should see the version of node installed in the system.
	4. If you get command not found error then either node is not installed properly or it is not added to path. If not added to path refer the [thread](https://stackoverflow.com/questions/27344045/installing-node-js-and-npm-on-windows-10)
- Open cmd and type ```cd <path to root of application/Website>```
- Type ```npm install```
- Once the installation is over. Type ```nodemon main.js``` to start the server
- Open Google Chrome and go to the url ```localhost:3000``` to open the web application

Running the Application
- Type the description in the input field provided and press draw to generate the drawings.
- Since the Sketch-RNN model is pretrained on a set of objects, only those objects are accepted. The list of the trained objects is provided on the right
- To redraw the same image, use the redraw option
- To generate a new image with same description, press draw button again.
- Press clear to the clear the canvas.

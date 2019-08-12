## exp-slide-viewer - experimental slide-document viewer

This project is an experimental slide, document viewer that uses connections between a document and a paper to improve reading experience.

Built using PDF.js, React v16.8, TypeScript 3.5

## Installation & Running

### Environments

Tested on `node v10.15.0`

You will need **two package managers**, both `yarn` and `npm`, since my own code uses yarn and PDF.js uses npm.



### Steps

1. Clone this repository using *recursive* clone - it'll also clone the submodules, not only this repository.

Running the project requires cloning all the submodules (which include the highlight layer addon and modified PDF.js)

`git clone --recurse-submodules [this-git-repo-url]`



2. Install all the dependencies in the submodules

   1. run `yarn install`

   2. run `yarn update`
      

3. `yarn start` on the project root :).

It will run a web server on port 1234 and a webpack dev server (typically on port 3000)



4. Open the URL displayed on the dev server (typically localhost:3000)



## Credit

I referred the code of react-pdf-highlighter by @agentcooper. Thanks for the great example!

# DBpedia-Property-Plus 

<p><img src="./other/dbpedia_property_plus.png" width="100"></p>

A tool that supports you to find facts/data from DBpedia (properties of DBpedia entity) in your content. And more than that.

## Screenshots

1. General Usage 
2. Custom Recipe - 1, create with property data 
3. Custom Recipe - 2, run & save
4. Custom Recipe - 3, custom recipe suggestion
<p align="center">
    <img src="./other/1.gif" width="200" style="margin-right: 20px;">
    <img src="./other/2.gif" width="200" style="margin-right: 20px;">
    <img src="./other/3.gif" width="200" style="margin-right: 20px;">
    <img src="./other/4.gif" width="200">
</p>
5. Entity Correction
<p align="center">
    <img src="./other/entity_correction-1.png" width="200" style="margin-right: 20px;">
    <img src="./other/entity_correction-2.png" width="200" style="margin-right: 20px;">
    <img src="./other/entity_correction-3.png" width="200">
</p>

More screenshots:

[1](./other/screenshot-1.png), [2](./other/screenshot-2.png), [3](./other/screenshot-3.png), [4](./other/screenshot-4.png), [5](./other/screenshot-5.png), [6](./other/screenshot-6.png)

## Features

- **Property Suggestion**: based on Named Entity Recognition result on user input.
- **"Custom Recipe"**: generating custom property using available DBpedia property data with custom scripts.

    More complex examples:
    
    ```JavaScript
    //
    // Custom Recipe: age
    // Properties: birth date
    // Example: age of Yao Ming
    // Result: 36
    let diff = Math.floor((new Date()).getTime() - (new Date(data[0])).getTime());
    let day = 1000 * 60 * 60 * 24;

    let days = Math.floor(diff/day);
    let months = Math.floor(days/31);
    let years = Math.floor(months/12);

    return years
    ```
    
    ```JavaScript
    //
    // Custom Recipe: death age
    // Properties: birth date, death date
    // Example: age of Albert Einstein
    // Result: 74
    let diff = Math.floor((new Date(data[0])).getTime() - (new Date(data[1])).getTime());
    let day = 1000 * 60 * 60 * 24;

    let days = Math.floor(diff/day);
    let months = Math.floor(days/31);
    let years = Math.floor(months/12);

    return years
    ```
- **Entity Correction**: add "sameAs"/"wikiPageDisambiguates" data to detected entity
- **Accented Character Support**: support accented characters like "ć"
- **Preference Suggestion**: users' preferences of properties will be stored locally and be suggested with higher priorty next time.
- **Priority Rules**: priority rules can be set between custom recipes that have common properties to prioritize one over another when both are available. 

## Try it yourself

I'm using virtual machines from the University of Southampton to host the application, so sadly you might not be able to access. However, you could follow the steps and setup up the application in your local enviroment.

1. Stanford CoreNLP Server

    The first thing is to run a local Stanford CoreNLP server. The application needs Stanford parser to parse user input. The parsed data will be further processed by the server part of this project.

    Check this website: [Stanford CoreNLP Server](https://stanfordnlp.github.io/CoreNLP/corenlp-server.html), follow the steps and setup your local own server.

2. (DBpedia-Property-Plus) Server

    The server is developed using Tornado framework. Check this [website](http://www.tornadoweb.org/en/stable/) and install Tornado.

    Two most important modules you should install before running the server:
      1. nltk

            This project uses NLTK to process the parsed sentence data mentioned above. It generates a NLTK tree. Then a simple algorithm is applied to extract entities from the tree according to POS tags of nodes.

            [Install NLTK](http://www.nltk.org/install.html)

            If any error related to NLTK occured when running the server script, that's probably because of missing of submodules. Read the log and download whatever needed. [Instructions](http://www.nltk.org/data.html) to follow.

      2. py-mini-racer

          This project uses py-mini-racer to execute `Custom Recipes` (which are some JavaScript scripts), and return the result to client. Note that `py-mini-racer` requires Linux/Mac OS.

          [Install py-mini-racer](https://github.com/sqreen/PyMiniRacer)

    Once everything installed, `cd` to the directory of the `server.py` file and run `python server.py`.

    Oh! ONE MORE THING!**Change the value of `STANFORD_CORENLP_SERVER_URL` in `server.py` to the url of your local Stanford CoreNLP server.** Then run the server :D.
  
3. Application

    There is a `README.md` file in the application folder. Read it and you will know how to run it.

    If you don't have `npm` in your machine, install it. [get npm](https://www.npmjs.com/get-npm?utm_source=house&utm_medium=homepage&utm_campaign=free%20orgs&utm_term=Install%20npm)
  
## More thoughts on this project

The project itself does not involve anything sophistecated. It basically just combines multiple brilliant APIs and generates very simple content suggestions. 

However, I do think there is value in this project. 

1. With the help of it, you can get some useful information in a relative simple way.
2. The original idea of this project was using Open Data to support user writing. It, to some extent, has acompolished this purpose. What's interesting is that in return it helps to create more formated truthful data with the Custom Recipe function. With little modification of the source code, an API could be created as a supplement of the DBpedia API. This API would be able to not only return what's in DBpedia, but also other userful information spotted or calculated from the existing data by its users. As you can see in the 4th screenshot, 48 properties and **3 custom recipes** were found. If a shared database could be set up in the cloud, and functions like "upload local recipes to cloud" and "download recipes from cloud" be added to the application, then this application will be much more powerful, and of course useful.

**What this project does now is extracting data from the Semantic Web. I hope, in the next stage, it will be able to contribute to the Semantic Web with the data it gathers from users.**

## Many thanks to

- [DBpedia Of Course](http://wiki.dbpedia.org/)
- [The Great Stanford CoreNLP](https://stanfordnlp.github.io/CoreNLP/)
- [Fantastic Vue.js](https://vuejs.org/)
- [Amazing Element UI](http://element.eleme.io/)

and all other libraries and modules involved in this project.

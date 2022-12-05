# Miracle

## Description
This is a customizable and modular web backend, that I'm building for myself to use in my projects.

## Stack
Frameworks: <a href="https://www.fastify.io/">Fastify</a>  
Databases: <a href="https://www.mysql.com/">MySQL</a>, <a href="https://redis.io/">Redis</a>  
Other: <a href="https://www.docker.com/">Docker<a>  

## Docker Hint
Building is done with <code>docker-compose build</code>.  
Running is done with <code>docker-compose up</code>.  
Shutting down is with <code>docker-compose down</code>.
For faster testing you can do <code>docker-compose rm -s nyananime-backend; docker-compose build; docker-compose up -d</code>.

## CLI Commands
| Command                                 | Description                                    |
| --------------------------------------- | ---------------------------------------------- |
| `yarn dev`                              | Starts the backend in developer mode.          |
| `yarn serve`                            | Starts the backend in production mode.         |
| `yarn pretty`                           | Formats the codebase using Prettify.           |
| `yarn lint`                             | Runs ESlint linter on the codebase.            |
| `yarn linty`                            | Automatically lints the codebase using ESlint. |
| `yarn typecheck`                        | Runs Typescript checker on the codebase.       |
            
## Contributing
If you want a feature added or you found a bug, make a new <a href="https://github.com/LamkasDev/miracle/issues">Issue</a>.  
If you want to contribute, make a new <a href="https://github.com/LamkasDev/miracle/pulls">Pull Request</a>.  
There are no guidelines or any of the sort and contributing is highly encougaraged!

## License
Miracle is licensed under the [GNU General Public License v3.0](https://github.com/LamkasDev/miracle/blob/master/LICENSE).

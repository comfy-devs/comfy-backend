all:  
  build: docker-compose build  
  run: docker-compose up  
  
other:  
  delete (containers): docker-compose down  
  delete (volumes): docker volume rm foxxy-backend_foxxy-backend  
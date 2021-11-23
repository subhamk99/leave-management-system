Run Test Database using the following command

docker run --name lms_test -ePOSTGRES_PASSWORD= test -e POSTGRES_DB= lms_test -e POSTGRES_USER=subham -p5433:5432 -d postgres:13.2
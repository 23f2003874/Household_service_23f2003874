class Config():
    DEBUG= False 
    SQLALCHEMY_TRACK_MODIFICATIONS = True 

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.sqlite3" 
    DEBUG= True 
    SECRET_KEY= "thisthisisiskeykey"
    SECURITY_PASSWORD_HASH= "bcrypt"
    SECURITY_PASSWORD_SALT= "this is a salt-salt"
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token" 

    CACHE_TYPE= 'RedisCache'
    CACHE_DEFAULT_TIMEOUT= 30
    CACHE_REDIS_PORT= 6379

    WTF_CSRF_ENABLED= False 
    
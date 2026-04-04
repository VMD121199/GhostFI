from flask import Flask, jsonify, request
from flask_restful import Resource, Api
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
api = Api(app)
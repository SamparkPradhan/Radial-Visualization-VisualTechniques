from flask import Flask, escape, request, render_template
import pandas as pd
import json
import sklearn.cluster
import numpy as np
import plotly.graph_objects as go
import plotly
import _plotly_utils

app = Flask(__name__)


# Initial Landing page
@app.route('/', methods=['GET', 'POST'])
def homepage():
    if request.method == 'POST':
        dataset_name = request.form.get('dataset')
    df = pd.read_csv('./static/iris.csv')
    df.rename(columns={"class": "quality"}, inplace=True)
    data_df = df.to_dict(orient='records')
    data_df = json.dumps(data_df, indent=2)
    return render_template('index.html', data=data_df)

# If we come back from any additional pages to homepage
@app.route('/home', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        dataset_name = request.form.get('dataset')
    df = pd.read_csv('./static/iris.csv')
    df.rename(columns={"class": "quality"}, inplace=True)
    data_df = df.to_dict(orient='records')
    data_df = json.dumps(data_df, indent=2)
    return render_template('index.html', data=data_df)

# Link To see the Assignment 1 radviz(Bonus Question)
@app.route('/assignment1', methods=['GET', 'POST'])
def assignment1():
    df = pd.read_csv('./static/dataset1_processed.csv')
    df_new = df[['age','educationLookups','fnlwgt','hours-per-week','salary']]
    df_new.rename(columns={"salary": "quality"}, inplace=True)
    data_df = df_new.to_dict(orient='records')
    data_df = json.dumps(data_df, indent=2)
    return render_template('assignment1.html', data=data_df)

# If the  catagorical columns in assignment 1 is changed
@app.route('/changeAssignment1', methods=['GET','POST'])
def changeAssignment1():
    df = pd.read_csv('./static/dataset1_processed.csv')
    df_new = df[['age', 'educationLookups', 'fnlwgt', 'hours-per-week']]
    selectedField = request.args['selectedField'];
    selectedField = str(selectedField)
    df_new["quality"] = df[selectedField]
    data_df = df_new.to_dict(orient='records')
    data_df = json.dumps(data_df, indent=2)
    return data_df

# For the selected dataset
@app.route('/selectedData', methods = ['GET','POST'])
def selectedData():
    datasetName = request.args['selectedFile'];
    if datasetName == 'iris':
        df = pd.read_csv('./static/iris.csv')
        df.rename(columns={"class": "quality"}, inplace=True)

    elif datasetName == 'winequality-red':
        df = pd.read_csv('./static/winequality-red.csv')

    elif datasetName == 'winequality-white':
        df = pd.read_csv('./static/winequality-white.csv')
    data_df = df.to_dict(orient='records')
    data_df = json.dumps(data_df, indent=2)
    return data_df

# For the selected method i.e, either class based or k-means
@app.route('/selectedMethod', methods = ['GET','POST'])
def selectedMethod():
    methodName = request.args['cluster'];
    datasetName = request.args['selectedFile'];
    clusterNo = request.args['kmeans-cluster'];
    iterMax = request.args['kmeans-iter'];
    if methodName == 'K-Means':
        if datasetName == 'iris':
            df = pd.read_csv('./static/iris.csv')
            df = df.iloc[:, :-1]
            if clusterNo == '(default)':
                clusterNo = 3
            else:
                clusterNo = int(clusterNo)
            if iterMax == '(default)':
                iterMax = 300
            else:
                iterMax = int(iterMax)
            estimator = sklearn.cluster.KMeans(n_clusters=clusterNo, max_iter=iterMax)
            estimator.fit(df)
            df['quality'] = estimator.labels_
        elif datasetName == 'winequality-red':
            df = pd.read_csv('./static/winequality-red.csv')
            df = df.iloc[:, :-1]
            if clusterNo == '(default)':
                clusterNo = 6
            else:
                clusterNo = int(clusterNo)
            if iterMax == '(default)':
                iterMax = 300
            else:
                iterMax = int(iterMax)
            estimator = sklearn.cluster.KMeans(n_clusters=clusterNo, max_iter=iterMax)
            estimator.fit(df)
            df['quality'] = estimator.labels_
        elif datasetName == 'winequality-white':
            df = pd.read_csv('./static/winequality-white.csv')
            df['alcohol'].replace('  ', np.nan, inplace=True)
            df.dropna(inplace=True)
            df = df.iloc[:, :-1]
            if clusterNo == '(default)':
                clusterNo = 7
            else:
                clusterNo = int(clusterNo)
            if iterMax == '(default)':
                iterMax = 300
            else:
                iterMax = int(iterMax)
            estimator = sklearn.cluster.KMeans(n_clusters=clusterNo, max_iter=iterMax)
            estimator.fit(df)
            df['quality'] = estimator.labels_

    elif methodName == 'Class-Based':
        if datasetName == 'iris':
            df = pd.read_csv('./static/iris.csv')
            df.rename(columns={"class": "quality"}, inplace=True)
        elif datasetName == 'winequality-red':
            df = pd.read_csv('./static/winequality-red.csv')
        elif datasetName == 'winequality-white':
            df = pd.read_csv('./static/winequality-white.csv')

    data_df = df.to_dict(orient='records')
    data_df = json.dumps(data_df, indent=2)
    return data_df

# To generate correlation matrix and plot it with plotly
@app.route('/generateCorrelation', methods = ['GET','POST'])
def generateCorrelation():
    pointData = request.args['data'];
    methodName = request.args['cluster'];
    datasetName = request.args['selectedFile'];
    clusterNo = request.args['kmeans-cluster'];
    iterMax = request.args['kmeans-iter'];
    className = pointData.split('/')
    pointName = className[-1]
    if methodName == 'Class-Based':
        if datasetName == 'iris':
            df = pd.read_csv('./static/iris.csv')
            df.rename(columns={"class": "quality"}, inplace=True)
            df = df.loc[df['quality'] == pointName].reset_index(drop=True)
            df = df.drop(df.columns[-1], axis=1)
            df = df.corr()

        elif datasetName == 'winequality-red':
            df = pd.read_csv('./static/winequality-red.csv')
            df = df.loc[df['quality'] == int(pointName)].reset_index(drop=True)
            df = df.drop(df.columns[-1], axis=1)
            df = df.corr()

        elif datasetName == 'winequality-white':
            df = pd.read_csv('./static/winequality-white.csv')
            df['alcohol'].replace('  ', np.nan, inplace=True)
            df.dropna(inplace=True)
            df['alcohol'] = df['alcohol'].astype(float)
            df = df.loc[df['quality'] == int(pointName)].reset_index(drop=True)
            df = df.drop(df.columns[-1], axis=1)
            df = df.corr()

    elif methodName == 'K-Means':
        if datasetName == 'iris':
            df = pd.read_csv('./static/iris.csv')
            df.rename(columns={"class": "quality"}, inplace=True)
            df = df.iloc[:, :-1]
            if clusterNo == '(default)':
                clusterNo = 3
            else:
                clusterNo = int(clusterNo)
            if iterMax == '(default)':
                iterMax = 300
            else:
                iterMax = int(iterMax)
            estimator = sklearn.cluster.KMeans(n_clusters=clusterNo, max_iter=iterMax)
            estimator.fit(df)
            df['quality'] = estimator.labels_
            df = df.loc[df['quality'] == int(pointName)].reset_index(drop=True)
            df = df.drop(df.columns[-1], axis=1)
            df = df.corr()

        elif datasetName == 'winequality-red':
            df = pd.read_csv('./static/winequality-red.csv')
            df = df.iloc[:, :-1]
            if clusterNo == '(default)':
                clusterNo = 6
            else:
                clusterNo = int(clusterNo)
            if iterMax == '(default)':
                iterMax = 300
            else:
                iterMax = int(iterMax)
            estimator = sklearn.cluster.KMeans(n_clusters=clusterNo, max_iter=iterMax)
            estimator.fit(df)
            df['quality'] = estimator.labels_
            df = df.loc[df['quality'] == int(pointName)].reset_index(drop=True)
            df = df.drop(df.columns[-1], axis=1)
            df = df.corr()

        elif datasetName == 'winequality-white':
            df = pd.read_csv('./static/winequality-white.csv')
            df['alcohol'].replace('  ', np.nan, inplace=True)
            df.dropna(inplace=True)
            df['alcohol'] = df['alcohol'].astype(float)
            df = df.iloc[:, :-1]
            if clusterNo == '(default)':
                clusterNo = 7
            else:
                clusterNo = int(clusterNo)
            if iterMax == '(default)':
                iterMax = 300
            else:
                iterMax = int(iterMax)
            estimator = sklearn.cluster.KMeans(n_clusters=clusterNo, max_iter=iterMax)
            estimator.fit(df)
            df['quality'] = estimator.labels_
            df = df.loc[df['quality'] == int(pointName)].reset_index(drop=True)
            df = df.drop(df.columns[-1], axis=1)
            df = df.corr()


    fig = go.Figure(data=go.Heatmap(
        z=df,
        x=df.columns,
        y=df.columns))
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON



if __name__ == '__main__':
    app.run(debug=True)


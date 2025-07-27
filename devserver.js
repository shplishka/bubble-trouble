var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var path = require("path");
var config = require("./webpack.config");

// using the webpack dev config, dev-server will serve static files in my build/public folder
var server = new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    contentBase: path.resolve(__dirname, "public"),
    historyApiFallback: true
});

const port = process.env.PORT || 3000;
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(port, host, function(err, result) {
    if (err) {
        return console.log(err);
    } else {
        console.log(`Listening at http://${host}:${port}/`);
    }
});

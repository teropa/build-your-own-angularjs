function sayHello(to) {
  return _.template("Hello, <%= name %>!")({name: to});
}

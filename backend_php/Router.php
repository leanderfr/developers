<?php
declare(strict_types=1);

class Router
{
    private array $routes = [];

    public function Get(string $path, Closure $handler): void
    {
        $this->routes[$path] = $handler;
    }

    public function Post(string $path, Closure $handler): void
    {
        $this->routes[$path] = $handler;
    }

    public function Patch(string $path, Closure $handler): void
    {
        $this->routes[$path] = $handler;
    }


    public function Delete(string $path, Closure $handler): void
    {
        $this->routes[$path] = $handler;
    }



    public function dispatch(string $path): void
    {

       foreach ($this->routes as $route => $handler) {

            $pattern = preg_replace("#\{\w+\}#", "([^\/]+)", $route);

            if (preg_match("#^$pattern$#", $path, $matches)) {

                array_shift($matches);

                call_user_func_array($handler, $matches);

                return;

            }
        }

        http_response_code(500);   // 500= erro interno
        // I wont give much details
        //echo "Page not found, invalid route or invalid method";
        echo "___Missing route__";
    }
}
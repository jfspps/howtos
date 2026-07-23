---
title: Blade templating
nav_order: 10
parent: Programming in PHP
---

# Blade templating

Blade templates can be found in `resources/views` (one would also find CSS and JS related files in `resources`).

The name of the template matches the route e.g. `index` for `index.blade.php`:

```php
Custom blade template:
<br/>
<br/>

{{--Check that the variable is defined with isset directive--}}
@isset($name)
{{--Only printed if the directive passed--}}
The name passed: {{$name}}
@endisset

<br/>
```

The route is defined near the top of `web.php`, with the parameter `name` passed on rendering the view:

```php
// access a Blade template
Route::get('/blade', function () {
    // pass the sub-phrase that precedes .blade.php i.e. index (of index.blade.php), with variables
    return view('index', [
        // note that the HTML elements are escaped and displayed as literally given, blocking cross-site scripting attacks;
        // HTML elements would have to be defined in the template instead
        'name' => 'JimJom<script></script>',
    ]);
});
```

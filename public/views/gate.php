<?php declare(strict_types=1); $invalid = isset($_GET['code']); $next = ($path ?? '') === 'admin' ? 'admin' : ''; ?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Demonstration — acces restreint</title>
<style>
body{margin:0;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;background:#f4f4f4;color:#333;display:grid;place-items:center;min-height:100vh;padding:16px;box-sizing:border-box}
.box{background:#fff;border-top:6px solid #FF7900;max-width:440px;width:100%;padding:26px}
h1{font-size:19px;color:#000;margin:0 0 10px}
p{line-height:1.5;margin:0 0 14px}
.warn{background:#fff3e6;border-left:4px solid #FF7900;padding:10px 12px;font-size:13px}
label{display:block;font-weight:700;margin-bottom:4px;color:#000}
input{width:100%;box-sizing:border-box;padding:10px;border:1px solid #bbb;font:inherit}
input:focus{outline:2px solid #FF7900;outline-offset:-1px}
button{margin-top:12px;width:100%;background:#FF7900;border:0;padding:11px;font:inherit;font-weight:700;cursor:pointer}
.err{color:#cd3c14;font-weight:700}
</style>
</head>
<body>
<form class="box" method="post" action="<?= Text::e(Config::basePath()) ?>/acces">
  <input type="hidden" name="next" value="<?= $next ?>">
  <h1>Environnement de demonstration</h1>
  <p class="warn">Ce site est une <b>maquette fonctionnelle</b> realisee par TRU GROUP. Ce n'est pas le site carrieres officiel d'Orange Centrafrique : n'y deposez pas de candidature reelle.</p>
  <p>L'acces est reserve aux personnes ayant recu le code de demonstration.</p>
  <?php if ($invalid): ?><p class="err">Code incorrect.</p><?php endif; ?>
  <label for="code">Code d'acces</label>
  <input id="code" name="code" type="password" autocomplete="off" required autofocus>
  <button type="submit">Acceder a la demonstration</button>
</form>
</body>
</html>

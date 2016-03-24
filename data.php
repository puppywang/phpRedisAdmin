<?php
/**
 * Created by PhpStorm.
 * User: Wang Yi
 * Date: 2016/3/22
 * Time: 21:16
 */

require_once 'includes/common.inc.php';

if ($redis) {
    if (!empty($server['keys'])) {
        $keys = $redis->keys($server['filter']);
    } else {
        $next = NULL;
        $keys = array();

        while ($r = $redis->scan($next, $server['filter'], $server['scansize'])) {
            $keys = array_merge($keys, $r);
        }
    }

    sort($keys);

    $namespaces = array(); // Array to hold our top namespaces.

    // Build an array of nested arrays containing all our namespaces and containing keys.
    foreach ($keys as $full_key) {
        // Ignore keys that are to long (Redis supports keys that can be way to long to put in an url).
        if (strlen($full_key) > $config['maxkeylen']) {
            continue;
        }

        $key = explode($server['seperator'], $full_key);

        // $d will be a reference to the current namespace.
        $d = &$namespaces;

        // We loop though all the namespaces for this key creating the array for each.
        // Each time updating $d to be a reference to the last namespace so we can create the next one in it.
        for ($i = 0; $i < (count($key) - 1); ++$i) {
            if (!isset($d[$key[$i]])) {
                $d[$key[$i]] = array();
            }

            $d = &$d[$key[$i]];
        }

        // Get the number of items in the key.
        $len = -1;

        if (!isset($config['faster']) || !$config['faster']) {
            switch ($redis->type($full_key)) {
                case Redis::REDIS_HASH:
                    $len = $redis->hLen($full_key);
                    break;

                case Redis::REDIS_LIST:
                    $len = $redis->lLen($full_key);
                    break;

                case Redis::REDIS_SET:
                    $len = $redis->sCard($full_key);
                    break;

                case Redis::REDIS_ZSET:
                    $len = $redis->zCard($full_key);
                    break;
            }
        }

        // Nodes containing an item named __phpredisadmin__ are also a key, not just a directory.
        // This means that creating an actual key named __phpredisadmin__ will make this bug.
        $d[$key[count($key) - 1]] = $len;

        // Unset $d so we don't accidentally overwrite it somewhere else.
        unset($d);
    }

    header('HTTP/1.0 200 OK');
    exit(jsond_encode($namespaces, JSOND_UNESCAPED_UNICODE));
} else {
    header('HTTP/1.0 404 Not Found');
    exit();
}
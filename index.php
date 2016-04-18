<?php

require_once 'includes/common.inc.php';

// This is basically the same as the click code in index.js.
// Just build the url for the frame based on our own url.
if (count($_GET) == 0) {
    $iframe = 'overview.php';
} else {
    $iframe = substr($_SERVER['REQUEST_URI'], strpos($_SERVER['REQUEST_URI'], '?') + 1);

    if (strpos($iframe, '&') !== false) {
        $iframe = substr_replace($iframe, '.php?', strpos($iframe, '&'), 1);
    } else {
        $iframe .= '.php';
    }
}


$page['css'][] = 'index';
$page['css'][] = 'zTreeStyle';
$page['js'][] = 'index';
$page['js'][] = 'jquery-cookie';
$page['js'][] = 'jquery.ztree.core.min';
$page['js'][] = 'jquery.ztree.exedit.min';

require 'includes/header.inc.php';

?>
<div id="sidebar">

    <h1 class="logo"><a href="?overview&amp;s=<?php echo $server['id'] ?>&amp;d=<?php echo $server['db'] ?>">phpRedisAdmin</a>
    </h1>

    <p>
        <select id="server">
            <?php foreach ($config['servers'] as $i => $srv) { ?>
                <option
                    value="<?php echo $i ?>" <?php echo ($server['id'] == $i) ? 'selected="selected"' : '' ?>><?php echo isset($srv['name']) ? format_html($srv['name']) : $srv['host'] . ':' . $srv['port'] ?></option>
            <?php } ?>
        </select>

        <?php if ($redis) { ?>

        <?php
        if (isset($server['databases'])) {
            $databases = $server['databases'];
        } else {
            $databases = $redis->config('GET', 'databases');
            $databases = $databases['databases'];
        }
        if ($databases > 1) { ?>
            <select id="database">
                <?php for ($d = 0; $d < $databases; ++$d) { ?>
                    <option value="<?php echo $d ?>" <?php echo ($server['db'] == $d) ? 'selected="selected"' : '' ?>>
                        database <?php echo $d ?></option>
                <?php } ?>
            </select>
        <?php } ?>
    </p>

    <p>
        <?php if (isset($login)) { ?>
            <a href="logout.php"><img src="images/logout.png" width="16" height="16" title="Logout" alt="[L]"></a>
        <?php } ?>
        <a href="?info&amp;s=<?php echo $server['id'] ?>&amp;d=<?php echo $server['db'] ?>"><img src="images/info.png"
                                                                                                 width="16" height="16"
                                                                                                 title="Info" alt="[I]"></a>
        <a href="?export&amp;s=<?php echo $server['id'] ?>&amp;d=<?php echo $server['db'] ?>"><img
                src="images/export.png" width="16" height="16" title="Export" alt="[E]"></a>
        <a href="?import&amp;s=<?php echo $server['id'] ?>&amp;d=<?php echo $server['db'] ?>"><img
                src="images/import.png" width="16" height="16" title="Import" alt="[I]"></a>
        <?php if (isset($server['flush']) && $server['flush']) { ?>
            <a href="?flush&amp;s=<?php echo $server['id'] ?>&amp;d=<?php echo $server['db'] ?>" id="flush"><img
                    src="images/flush.png" width="16" height="16" title="Flush" alt="[F]"></a>
        <?php } ?>
    </p>

    <p>
        <a href="?edit&amp;s=<?php echo $server['id'] ?>&amp;d=<?php echo $server['db'] ?>" class="add">Add another
            key</a>
    </p>

    <p>
        <input type="text" id="server_filter" size="14" value="<?php echo format_html($server['filter']); ?>"
               placeholder="type here to server filter" class="info">
        <button id="btn_server_filter">Filter!</button>
    </p>

    <p>
        <input type="text" id="filter" size="24" value="type here to filter" placeholder="type here to filter"
               class="info">
    </p>

    <div id="keys" class="ztree">
        <div class="loading"><i></i>Loading...</div>
    </div>
    <!-- #keys -->

    <?php } else { ?>
</p>
<div style="color:red">Can't connect to this server</div>
<?php } ?>

</div><!-- #sidebar -->

<div id="resize"></div>
<div id="resize-layover"></div>

<div id="frame">
    <iframe src="<?php echo format_html($iframe) ?>" id="iframe" frameborder="0" scrolling="0"></iframe>
</div><!-- #frame -->

<?php

require 'includes/footer.inc.php';

?>

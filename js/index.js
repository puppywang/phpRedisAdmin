$(function () {
    $('#server').change(function (e) {
        if (location.href.indexOf('?') == -1) {
            location.href = location.href + '?s=' + e.target.value;
        } else if (location.href.indexOf('&s=') == -1) {
            location.href = location.href + '&s=' + e.target.value;
        } else {
            location.href = location.href.replace(/s=[0-9]*/, 's=' + e.target.value);
        }
    });


    $('#database').change(function (e) {
        if (location.href.indexOf('?') == -1) {
            location.href = location.href + '?d=' + e.target.value;
        } else if (location.href.indexOf('&d=') == -1) {
            location.href = location.href + '&d=' + e.target.value;
        } else {
            location.href = location.href.replace(/d=[0-9]*/, 'd=' + e.target.value);
        }
    });

    (function($) {
        $.QueryString = (function(a) {
            if (a == "") return {};
            var b = {};
            for (var i = 0; i < a.length; ++i)
            {
                var p=a[i].split('=');
                if (p.length != 2) continue;
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
            return b;
        })(window.location.search.substr(1).split('&'))
    })(jQuery);

    $.QueryString = $.extend({s:0, d:0, key:''}, $.QueryString);

    $.get("data.php", { s: $.QueryString['s'], d: $.QueryString['d'], key: $.QueryString['key'], filter: $.QueryString['filter'] }, function (data) {
        var setting = {
            callback: {
                onClick: function(e, tree_id, tree_node) {
                    if (!tree_node.url || tree_node.url.indexOf('/?') == -1) {
                        var ztree_obj = $.fn.zTree.getZTreeObj("keys");
                        ztree_obj.expandNode(tree_node, null, null, null, false);
                        return;
                    }

                    e.preventDefault();

                    var href;

                    if ((tree_node.url.indexOf('?') == -1) ||
                        (tree_node.url.indexOf('?') == (tree_node.url.length - 1))) {
                        href = 'overview.php';
                    } else {
                        href = tree_node.url.substr(tree_node.url.indexOf('?') + 1);

                        if (href.indexOf('&') != -1) {
                            href = href.replace('&', '.php?');
                        } else {
                            href += '.php';
                        }
                    }

                    if (href.indexOf('flush.php') == 0) {
                        if (confirm('Are you sure you want to delete this key and all it\'s values?')) {
                            $.ajax({
                                type: "POST",
                                url: href,
                                data: 'post=1',
                                success: function () {
                                    window.location.reload();
                                }
                            });
                        }
                    } else {
                        $('#iframe').attr('src', href);
                    }
                }
            },
            view: {
                addHoverDom: function(tree_id, tree_node) {
                    if (tree_node.url && tree_node.url.indexOf('/?') != -1) return;
                    var tree_anchor = $("#" + tree_node.tId + "_a");
                    if ($("#deltree_" + tree_node.tId).length > 0) return;
                    var del_tree_btn_str = "<span id='deltree_space_" + tree_node.tId + "' >&nbsp;</span><a class='deltree' id='deltree_" + tree_node.tId + "' href='delete.php?s=" + $.QueryString['s'] + "&d=" + $.QueryString['d'] + "&tree=" + tree_node.key + ":'><img src='images/delete.png' width='10' height='10' title='Delete tree' alt='[X]'></a>";
                    tree_anchor.append(del_tree_btn_str);
                    var deltree = $("#deltree_" + tree_node.tId);
                    if (deltree) {
                        deltree.bind("click", function (e) {
                            e.preventDefault();
                            e.stopPropagation();

                            if (confirm('Are you sure you want to delete this whole tree and all it\'s keys?')) {
                                $.ajax({
                                    type: "POST",
                                    url: this.href,
                                    data: 'post=1',
                                    success: function (url) {
                                        top.location.href = top.location.pathname + url;
                                    }
                                });
                            }

                            return true;
                        });
                    }
                },
                removeHoverDom: function(tree_id, tree_node) {
                    $("#deltree_" + tree_node.tId).unbind().remove();
                    $("#deltree_space_" + tree_node.tId).unbind().remove();
                }
            }
        };
        $(document).ready(function() {
            try {
                var convertZTreeData = function (data, parent_key) {
                    var out_data = [];
                    if (parent_key.length) parent_key += ':';
                    if (data instanceof Object) {
                        for (var key in data) {
                            if (data.hasOwnProperty(key)) {
                                if (key == '\n' && data[key] instanceof Array) {
                                    var data_key_len = data[key].length;
                                    for (var i = 0; i < data_key_len; i++) {
                                        var arr_child_data = {};
                                        arr_child_data['name'] = data[key][i];
                                        arr_child_data['url'] = '/?view&s=' + $.QueryString['s'] + '&d=' + $.QueryString['d'] + '&key=' + parent_key + data[key][i];
                                        out_data.push(arr_child_data);
                                    }
                                } else if (data[key] instanceof Object) {
                                    var obj_data = {};
                                    obj_data['name'] = key;
                                    obj_data['key'] = parent_key + key;
                                    if ($.QueryString['key'].indexOf(obj_data['key']) == 0) {
                                        obj_data['open'] = true;
                                    }
                                    obj_data['children'] = convertZTreeData(data[key], obj_data['key']);
                                    out_data.push(obj_data);
                                }
                            }
                        }
                    }
                    return out_data;
                };
                $("div.loading").remove();
                $.fn.zTree.init($("#keys"), setting, convertZTreeData(JSON.parse(data), ''));
            } catch(e) {
                alert(e.toString());
            }
        });
    });

    $('#btn_server_filter').click(function () {
        var filter = $('#server_filter').val();
        location.href = top.location.pathname + '?overview&s=' + $('#server').val() + '&d=' + ($('#database').val() || '') + '&filter=' + filter;
    });

    $('#server_filter').keydown(function (e) {
        if (e.keyCode == 13) {
            $('#btn_server_filter').click();
        }
    });

    $('#filter').focus(function () {
        if ($(this).hasClass('info')) {
            $(this).removeClass('info').val('');
        }
    }).keyup(function () {
        var val = $(this).val();

        $('li:not(.folder)').each(function (i, el) {
            var key = $('a', el).get(0);
            var key = unescape(key.href.substr(key.href.indexOf('key=') + 4));

            if (key.indexOf(val) == -1) {
                $(el).addClass('hidden');
            } else {
                $(el).removeClass('hidden');
            }
        });

        $('li.folder').each(function (i, el) {
            if ($('li:not(.hidden, .folder)', el).length == 0) {
                $(el).addClass('hidden');
            } else {
                $(el).removeClass('hidden');
            }
        });
    });

    var isResizing = false;
    var lastDownX = 0;
    var lastWidth = 0;

    var resizeSidebar = function (w) {
        $('#sidebar').css('width', w);
        $('#keys').css('width', w);
        $('#resize').css('left', w + 10);
        $('#resize-layover').css('left', w + 15);
        $('#frame').css('left', w + 15);
    };

    if (parseInt($.cookie('sidebar')) > 0) {
        resizeSidebar(parseInt($.cookie('sidebar')));
    }

    $('#resize').on('mousedown', function (e) {
        isResizing = true;
        lastDownX = e.clientX;
        lastWidth = $('#sidebar').width();
        $('#resize-layover').css('z-index', 1000);
        e.preventDefault();
    });
    $(document).on('mousemove', function (e) {
        if (!isResizing) {
            return;
        }

        var w = lastWidth - (lastDownX - e.clientX);
        if (w < 250) {
            w = 250;
        } else if (w > 1000) {
            w = 1000;
        }

        resizeSidebar(w);
        $.cookie('sidebar', w);
    }).on('mouseup', function (e) {
        isResizing = false;
        $('#resize-layover').css('z-index', 0);
    });
});


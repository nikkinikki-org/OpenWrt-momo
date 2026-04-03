'use strict';
'require form';
'require view';
'require uci';
'require fs';
'require poll';
'require tools.momo as momo';

return view.extend({
    load: function () {
        return Promise.all([
            uci.load('momo'),
            momo.getPaths(),
            momo.getAppLog(),
            momo.getCoreLog()
        ]);
    },
    render: function (data) {
        const paths = data[1];
        const appLog = data[2];
        const coreLog = data[3];

        let m, s, o;

        m = new form.Map('momo');

        s = m.section(form.NamedSection, 'log', 'log', _('Log Cleanup'));

        o = s.option(form.Flag, 'log_cleanup_enabled', _('Scheduled Log Cleanup'));
        o.rmempty = false;

        o = s.option(form.Value, 'log_cleanup_cron_expression', _('Log Cleanup Cron Expression'));
        o.retain = true;
        o.rmempty = false;
        o.placeholder = '0 4 * * *';
        o.depends('log_cleanup_enabled', '1');
        o.description = _('Run unconditional log cleanup at the configured cron schedule.');

        o = s.option(form.Flag, 'log_cleanup_size_enabled', _('Size-based Log Cleanup'));
        o.rmempty = false;

        o = s.option(form.Value, 'log_cleanup_size_check_cron_expression', _('Log Size Check Cron Expression'));
        o.retain = true;
        o.rmempty = false;
        o.placeholder = '*/30 * * * *';
        o.depends('log_cleanup_size_enabled', '1');
        o.description = _('Check log size at the configured cron schedule before cleaning up.');

        o = s.option(form.Value, 'log_cleanup_size_mb', _('Log Cleanup Size Threshold (MB)'));
        o.datatype = 'uinteger';
        o.placeholder = '50';
        o.depends('log_cleanup_size_enabled', '1');
        o.description = _('Clear app, core and debug logs when their total size reaches this threshold.');

        s = m.section(form.NamedSection, 'placeholder', 'placeholder', _('Log'));

        s.tab('app_log', _('App Log'));

        o = s.taboption('app_log', form.Button, 'clear_app_log');
        o.inputstyle = 'negative';
        o.inputtitle = _('Clear Log');
        o.onclick = function (_, section_id) {
            m.lookupOption('_app_log', section_id)[0].getUIElement(section_id).setValue('');
            return momo.clearAppLog();
        };

        o = s.taboption('app_log', form.TextValue, '_app_log');
        o.rows = 25;
        o.wrap = false;
        o.load = function (section_id) {
            return appLog;
        };
        o.write = function (section_id, formvalue) {
            return true;
        };
        poll.add(L.bind(function () {
            const option = this;
            return L.resolveDefault(momo.getAppLog()).then(function (log) {
                option.getUIElement('placeholder').setValue(log);
            });
        }, o));

        o = s.taboption('app_log', form.Button, 'scroll_app_log_to_bottom');
        o.inputtitle = _('Scroll To Bottom');
        o.onclick = function (_, section_id) {
            const element = m.lookupOption('_app_log', section_id)[0].getUIElement(section_id).node.firstChild;
            element.scrollTop = element.scrollHeight;
        };

        s.tab('core_log', _('Core Log'));

        o = s.taboption('core_log', form.Button, 'clear_core_log');
        o.inputstyle = 'negative';
        o.inputtitle = _('Clear Log');
        o.onclick = function (_, section_id) {
            m.lookupOption('_core_log', section_id)[0].getUIElement(section_id).setValue('');
            return momo.clearCoreLog();
        };

        o = s.taboption('core_log', form.TextValue, '_core_log');
        o.rows = 25;
        o.wrap = false;
        o.load = function (section_id) {
            return coreLog;
        };
        o.write = function (section_id, formvalue) {
            return true;
        };
        poll.add(L.bind(function () {
            const option = this;
            return L.resolveDefault(momo.getCoreLog()).then(function (log) {
                option.getUIElement('placeholder').setValue(log);
            });
        }, o));

        o = s.taboption('core_log', form.Button, 'scroll_core_log_to_bottom');
        o.inputtitle = _('Scroll To Bottom');
        o.onclick = function (_, section_id) {
            const element = m.lookupOption('_core_log', section_id)[0].getUIElement(section_id).node.firstChild;
            element.scrollTop = element.scrollHeight;
        };

        s.tab('debug_log', _('Debug Log'));

        o = s.taboption('debug_log', form.Button, '_generate_download_debug_log');
        o.inputstyle = 'negative';
        o.inputtitle = _('Generate & Download');
        o.onclick = function () {
            return momo.debug().then(function () {
                fs.read_direct(paths.debug_log_path, 'blob').then(function (data) {
                    // create url
                    const url = window.URL.createObjectURL(data, { type: 'text/markdown' });
                    // create link
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'debug.log';
                    // append to body
                    document.body.appendChild(link);
                    // download
                    link.click();
                    // remove from body
                    document.body.removeChild(link);
                    // revoke url
                    window.URL.revokeObjectURL(url);
                });
            });
        };

        return m.render();
    }
});

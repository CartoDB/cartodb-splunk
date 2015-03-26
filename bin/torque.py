#!/usr/bin/env python

# time=<string> aggregation=<string> frames=<string> duration=<string> resolution=<string>
# torque_1427310725941({"layergroupid":"cf28c540d3cf15a29a759f84ff440679:0","metadata":{"torque":{"0":{"start":-1796072400000,"end":-1414843200000,"data_steps":861786,"column_type":"date"}}},"cdn_url":{"http":"ashbu.cartocdn.com","https":"cartocdn-ashbu.global.ssl.fastly.net"},"last_updated":"1970-01-01T00:00:00.000Z"});

import sys
import os
import json

import httplib2


try:
    import xml.etree.cElementTree as et
except ImportError:
    import xml.etree.ElementTree as et

from splunklib.searchcommands import dispatch, StreamingCommand, Configuration, Option, validators
from tools.cache import FileCache


@Configuration()
class TorqueCommand(StreamingCommand):
    time = Option(
        doc='''
        **Syntax:** **time=***<fieldname>*
        **Description:** Name of the field that holds the time attribute''',
        require=False, default="time", validate=validators.Fieldname())

    aggregation = Option(
        doc='''
        **Syntax:** **aggregation=***customaggregation*
        **Description:** The aggregation function''',
        require=False, default="count(id")

    frames = Option(
        doc='''
        **Syntax:** **frames=***customframes*
        **Description:** Frame count''',
        require=False, default="512")

    duration = Option(
        doc='''
        **Syntax:** **frames=***customduration*
        **Description:** Animation duration''',
        require=False, default="30")

    resolution = Option(
        doc='''
        **Syntax:** **frames=***customresolution*
        **Description:** Resolution''',
        require=False, default="2")

    api_key = ""
    cache = FileCache(1000000, 62)

    def get_api_key(self):
        try:
            response = self.service.get("/servicesNS/nobody/cartodb/configs/conf-setup/cartodb")
            xml = response.body.read()
            root = et.fromstring(xml)
            self.api_key = root.findall(".//{http://dev.splunk.com/ns/rest}key[@name='api_key']")[0].text.strip()
        except Exception as e:
            raise Exception("Could not get api_key, is the app set up correctly?", e)

    def _parseJSON(self, obj):
        if isinstance(obj, dict):
            newobj = {}
            for key, value in obj.iteritems():
                key = str(key)
                newobj[key] = self._parseJSON(value)
        elif isinstance(obj, list):
            newobj = []
            for value in obj:
                newobj.append(self._parseJSON(value))
        elif isinstance(obj, unicode):
            newobj = str(obj)
        else:
            newobj = obj
        return newobj

    def get_template_url(self):
        # fixme

    def stream(self, records):
        basepath = os.path.join(os.environ['SPLUNK_HOME'], "etc", "apps", "cartodb")
        cachefile = os.path.join(basepath, "bin", "lib", "torque.cache")

        if self.api_key is "":
            self.get_api_key()
        self.cache.read_cache_file(cachefile)

        for record in records:
            # fixme: this pattern could be used to render a torque tile
            # or fetch from cache
            # however, would want to place this handling in routing table,
            # not splunk command.

            # lat = str(round(float(record[self.lat]), 5))
            # lng = str(round(float(record[self.lng]), 5))

            # cache_key = "%s,%s" % (lat, lng)
            # try:
            #     location = self.cache.get(cache_key)
            # except KeyError:
            #     location = self.reverse_geocode(lat, lng)

            # self.cache.set(cache_key, location)
            # self.add_fields(record, location)

            yield record
        try:
            self.cache.write_cache_file(cachefile)
        except:
            self.logger.error("Could not write cache file")


dispatch(TorqueCommand, sys.argv, sys.stdin, sys.stdout, __name__)

# Build the container project root directory in this sequence:
#   $ npm install
#   $ npm run build
#   $ buildah bud -t smee-client:latest -f containers/Dockerfile

FROM registry.fedoraproject.org/fedora-minimal:37
USER root
RUN microdnf update -y && microdnf install -y nodejs && rm -rf /var/cache/yum
ADD dist/src /smee-client
COPY package.json /smee-client
RUN cd /smee-client && npm install

RUN chmod 775 /smee-client/smee.js && ln -s /smee-client/smee.js /usr/local/bin/smee-client

USER 1001
ENTRYPOINT ["/usr/local/bin/smee-client"]
CMD ["--help"]

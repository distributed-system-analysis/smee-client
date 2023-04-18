# Build the container using:
#   $ buildah bud -t smee-client:latest -f containers/Dockerfile

# First create a base stage with NodeJS installed.
FROM registry.fedoraproject.org/fedora-minimal:37 AS smee-client-base
USER root
RUN microdnf update -y && microdnf install -y nodejs && rm -r /var/cache/yum

# Build the javascript components from the typescript sources in a separate
# stage so that the development environment dependencies are not carried to the
# installation stage.
FROM smee-client-base AS smee-client-builder
ADD . /sc
WORKDIR /sc
RUN npm ci && npm run build

# Install the built javascript and install all the non-development package
# dependencies.
FROM smee-client-base AS smee-client-install
COPY --from=smee-client-builder /sc/dist/src/client.js /smee-client/
COPY --from=smee-client-builder /sc/dist/src/version.js /smee-client/
COPY --from=smee-client-builder /sc/dist/src/cmd.js /smee-client/
COPY --from=smee-client-builder /sc/dist/src/smee.js /smee-client/
COPY --from=smee-client-builder /sc/package.json /smee-client/
RUN cd /smee-client && npm install --omit dev
RUN chmod 775 /smee-client/smee.js && ln -s /smee-client/smee.js /usr/local/bin/smee-client

# Execute any command as a non-root user.
#
# E.g. `podman run -it localhost/smee-client:latest --help` will display the
# smee-client help text.
USER 1001
ENTRYPOINT ["/usr/local/bin/smee-client"]

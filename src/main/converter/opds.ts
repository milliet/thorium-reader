import { injectable } from "inversify";

import * as moment from "moment";

import {
    OpdsFeedView,
    OpdsLinkView,
    OpdsPublicationView,
    OpdsResultType,
    OpdsResultView,
} from "readium-desktop/common/views/opds";

import { OpdsFeedDocument } from "readium-desktop/main/db/document/opds";

import { OPDSFeed } from "@r2-opds-js/opds/opds2/opds2";
import { OPDSLink } from "@r2-opds-js/opds/opds2/opds2-link";
import { OPDSPublication } from "@r2-opds-js/opds/opds2/opds2-publication";

import {
    convertContributorArrayToStringArray,
    convertMultiLangStringToString,
} from "readium-desktop/common/utils";

@injectable()
export class OpdsFeedViewConverter {
    public convertDocumentToView(document: OpdsFeedDocument): OpdsFeedView {
        return {
            identifier: document.identifier,
            title: document.title,
            url: document.url,
        };
    }

    public convertOpdsLinkToView(link: OPDSLink): OpdsLinkView {
        // Title could be defined on multiple lines
        // Only keep the first one
        let title = link.Title;
        const titleParts = title.split("\n");
        title = titleParts[0];

        return  {
            title,
            url: link.Href,
            publicationCount: (link.Children) ? link.Children.length : null,
        };
    }

    public convertOpdsPublicationToView(publication: OPDSPublication): OpdsPublicationView {
        const metadata = publication.Metadata;
        const title = convertMultiLangStringToString(metadata.Title);
        const authors = convertContributorArrayToStringArray(metadata.Author);
        const publishers = convertContributorArrayToStringArray(metadata.Publisher);
        const tags = metadata.Subject.map((subject) => subject.Name);

        let publishedAt = null;

        if (metadata.PublicationDate) {
            publishedAt = moment(metadata.PublicationDate).toISOString();
        }

        let cover = null;

        if (publication.Images && publication.Images.length > 0) {
            cover = {
                url: publication.Images[0].Href,
            };
        }

        return  {
            title,
            authors,
            publishers,
            workIdentifier: metadata.Identifier,
            description: metadata.Description,
            tags,
            languages: metadata.Language,
            publishedAt,
            cover,
        };
    }

    public convertOpdsFeedToView(feed: OPDSFeed): OpdsResultView {
        const title = convertMultiLangStringToString(feed.Metadata.Title);
        let type = OpdsResultType.NavigationFeed;
        let navigation = null;
        let publications = null;

        if (feed.Publications) {
            // result page containing publications
            type = OpdsResultType.PublicationFeed;
            publications = feed.Publications.map((item) => {
                return this.convertOpdsPublicationToView(item);
            });
        } else {
            // result page containing navigation
            navigation = feed.Navigation.map((item) => {
                return this.convertOpdsLinkToView(item);
            });
        }

        return {
            title,
            type,
            publications,
            navigation,
        };
    }

}